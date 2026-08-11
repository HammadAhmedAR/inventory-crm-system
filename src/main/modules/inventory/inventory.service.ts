import { Prisma, PrismaClient } from "@prisma/client";

export type InventoryFilters = {
  status?: string;
  search?: string;
  make?: string;
  modelId?: string;
  modelName?: string;
  bodyType?: string;
  saleStatus?: string;
  healthStatus?: string;
};

const statusList = ["READY_FOR_SALE", "UNDER_REPAIR", "NEEDS_REPAIR", "PENDING_CHECK"] as const;
const saleStatusList = ["AVAILABLE", "RESERVED", "SOLD"] as const;
const repairStatusList = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
const issueCategoryList = ["MECHANICAL", "ELECTRICAL", "BODYWORK", "DETAILING"] as const;
const bodyTypeList = ["SUV", "SUBCOMPACT_SUV", "BIKE", "SCOOTER", "SEDAN", "HATCHBACK"] as const;

function toNumber(value: number | string | undefined | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildInventoryWhere(filters: InventoryFilters = {}) {
  const where: Prisma.VehicleChassisWhereInput = {};

  if (filters.status) {
    const normalized = filters.status.toUpperCase();

    if (["AVAILABLE", "RESERVED", "SOLD"].includes(normalized)) {
      where.saleStatus = normalized;
    } else if (normalized === "READY_FOR_SALE") {
      where.healthStatus = "READY_FOR_SALE";
    } else if (normalized === "REPAIR") {
      where.healthStatus = {
        in: ["UNDER_REPAIR", "NEEDS_REPAIR", "PENDING_CHECK"],
      };
    } else if (statusList.includes(normalized as (typeof statusList)[number])) {
      where.healthStatus = normalized as (typeof statusList)[number];
    }
  }

  if (filters.saleStatus) where.saleStatus = filters.saleStatus.toUpperCase();
  if (filters.healthStatus) {
    const health = filters.healthStatus.toUpperCase();
    where.healthStatus = health === "REPAIR" ? { in: ["UNDER_REPAIR", "NEEDS_REPAIR", "PENDING_CHECK"] } : health;
  }

  const modelFilter: Prisma.VehicleModelWhereInput = {};
  if (filters.make?.trim()) modelFilter.make = filters.make.trim();
  if (filters.modelId?.trim()) modelFilter.id = filters.modelId.trim();
  if (filters.modelName?.trim()) modelFilter.modelName = filters.modelName.trim();
  if (filters.bodyType?.trim()) modelFilter.bodyType = filters.bodyType.trim().toUpperCase();
  if (Object.keys(modelFilter).length) where.model = { is: modelFilter };

  if (filters.search?.trim()) {
    const query = filters.search.trim();
    where.OR = [
      { chassisNumber: { contains: query } },
      { engineNumber: { contains: query } },
      { color: { contains: query } },
      { model: { is: { make: { contains: query } } } },
      { model: { is: { modelName: { contains: query } } } },
    ];
  }

  return where;
}

export async function getInventoryUnits(prisma: PrismaClient, filters: InventoryFilters = {}) {
  return prisma.vehicleChassis.findMany({
    where: buildInventoryWhere(filters),
    include: {
      model: true,
      repairs: {
        orderBy: { loggedAt: "desc" },
      },
      salesRecord: true,
    },
    orderBy: [{ saleStatus: "asc" }, { updatedAt: "desc" }],
  });
}

export async function updateChassisStatus(
  prisma: PrismaClient,
  data: {
    chassisNumber: string;
    saleStatus?: string;
    healthStatus?: string;
  },
) {
  const current = await prisma.vehicleChassis.findUnique({
    where: { chassisNumber: data.chassisNumber },
  });

  if (!current) {
    throw new Error(`Vehicle ${data.chassisNumber} was not found.`);
  }

  const nextSaleStatus = data.saleStatus?.toUpperCase() ?? current.saleStatus;
  const nextHealthStatus = data.healthStatus?.toUpperCase() ?? current.healthStatus;

  if (!saleStatusList.includes(nextSaleStatus as (typeof saleStatusList)[number])) {
    throw new Error(`Invalid sale status: ${nextSaleStatus}.`);
  }

  if (!statusList.includes(nextHealthStatus as (typeof statusList)[number])) {
    throw new Error(`Invalid health status: ${nextHealthStatus}.`);
  }

  return prisma.$transaction(async (tx) => {
    // READY_FOR_SALE is the explicit "resolve all" action used by the health board.
    if (data.healthStatus && nextHealthStatus === "READY_FOR_SALE") {
      await tx.vehicleRepairLog.updateMany({
        where: { chassisNumber: data.chassisNumber, repairStatus: { not: "COMPLETED" } },
        data: { repairStatus: "COMPLETED", resolvedAt: new Date() },
      });
    }

    return tx.vehicleChassis.update({
      where: { chassisNumber: data.chassisNumber },
      data: { saleStatus: nextSaleStatus, healthStatus: nextHealthStatus },
      include: {
        model: true,
        repairs: { orderBy: { loggedAt: "desc" } },
        salesRecord: true,
      },
    });
  });
}

export async function createInventoryUnit(prisma: PrismaClient, data: {
  chassisNumber: string; engineNumber?: string; make: string; modelName: string; year: number | string;
  bodyType: string; color: string; baseQuotingPrice: number | string; minSellingPrice?: number | string; costPrice?: number | string;
  keysCount?: number | string; documentsPresent?: boolean;
}) {
  const chassisNumber = data.chassisNumber.trim().toUpperCase();
  const make = data.make.trim(); const modelName = data.modelName.trim(); const color = data.color.trim();
  const year = toNumber(data.year); const baseQuotingPrice = toNumber(data.baseQuotingPrice);
  const bodyType = data.bodyType.trim().toUpperCase(); const keysCount = data.keysCount === undefined ? 2 : toNumber(data.keysCount);
  const minSellingPrice = data.minSellingPrice === undefined || data.minSellingPrice === "" ? null : toNumber(data.minSellingPrice);
  const costPrice = data.costPrice === undefined || data.costPrice === "" ? null : toNumber(data.costPrice);
  if (!chassisNumber || !make || !modelName || !color) throw new Error("Chassis, make, model, and color are required.");
  if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 2) throw new Error("Enter a valid model year.");
  if (baseQuotingPrice <= 0) throw new Error("Base quoting price must be greater than zero.");
  if (minSellingPrice !== null && minSellingPrice <= 0) throw new Error("Floor price must be greater than zero.");
  if (costPrice !== null && costPrice <= 0) throw new Error("Cost price must be greater than zero.");
  if (!bodyTypeList.includes(bodyType as (typeof bodyTypeList)[number])) throw new Error("Invalid body type.");
  if (![1, 2].includes(keysCount)) throw new Error("Key count must be either 1 or 2.");

  return prisma.$transaction(async (tx) => {
    let model = await tx.vehicleModel.findFirst({ where: { make, modelName, year, bodyType } });
    model ??= await tx.vehicleModel.create({ data: { make, modelName, year, bodyType } });
    return tx.vehicleChassis.create({
      data: { chassisNumber, engineNumber: data.engineNumber?.trim() || null, modelId: model.id, color, baseQuotingPrice, minSellingPrice, costPrice, keysCount, documentsPresent: Boolean(data.documentsPresent), saleStatus: "AVAILABLE", healthStatus: "PENDING_CHECK" },
      include: { model: true, repairs: true, salesRecord: true },
    });
  });
}

export async function logRepairIssue(
  prisma: PrismaClient,
  data: {
    chassisNumber: string;
    issueCategory?: string;
    description: string;
    costIncurred?: number | string;
    repairStatus?: string;
  },
) {
  const chassis = await prisma.vehicleChassis.findUnique({
    where: { chassisNumber: data.chassisNumber },
  });

  if (!chassis) {
    throw new Error(`Vehicle ${data.chassisNumber} was not found.`);
  }

  const issueCategory = data.issueCategory?.toUpperCase() || "MECHANICAL";
  const repairStatus = (data.repairStatus || "PENDING").toUpperCase();
  const costValue = toNumber(data.costIncurred);

  if (!data.description.trim()) {
    throw new Error("A repair description is required.");
  }

  if (!issueCategoryList.includes(issueCategory as (typeof issueCategoryList)[number])) {
    throw new Error(`Invalid repair category: ${issueCategory}.`);
  }

  if (!repairStatusList.includes(repairStatus as (typeof repairStatusList)[number])) {
    throw new Error(`Invalid repair status: ${repairStatus}.`);
  }

  if (costValue < 0) {
    throw new Error("Repair cost cannot be negative.");
  }

  const log = await prisma.vehicleRepairLog.create({
    data: {
      chassisNumber: data.chassisNumber,
      issueCategory,
      description: data.description.trim(),
      costIncurred: costValue,
      repairStatus,
    },
  });

  await prisma.vehicleChassis.update({
    where: { chassisNumber: data.chassisNumber },
    data: {
      healthStatus: repairStatus === "IN_PROGRESS" ? "UNDER_REPAIR" : "NEEDS_REPAIR",
      saleStatus: chassis.saleStatus,
    },
  });

  return {
    log,
    chassis: await prisma.vehicleChassis.findUnique({
      where: { chassisNumber: data.chassisNumber },
      include: {
        model: true,
        repairs: { orderBy: { loggedAt: "desc" } },
        salesRecord: true,
      },
    }),
  };
}

export async function updateCustodyChecklist(
  prisma: PrismaClient,
  data: {
    chassisNumber: string;
    keysCount?: number | string;
    documentsPresent?: boolean;
  },
) {
  const chassis = await prisma.vehicleChassis.findUnique({
    where: { chassisNumber: data.chassisNumber },
  });

  if (!chassis) {
    throw new Error(`Vehicle ${data.chassisNumber} was not found.`);
  }

  const keysCount = data.keysCount === undefined ? chassis.keysCount : toNumber(data.keysCount);
  if (![1, 2].includes(keysCount)) {
    throw new Error("Key count must be either 1 or 2.");
  }

  return prisma.vehicleChassis.update({
    where: { chassisNumber: data.chassisNumber },
    data: {
      keysCount,
      documentsPresent: Boolean(data.documentsPresent ?? chassis.documentsPresent),
    },
    include: {
      model: true,
      repairs: { orderBy: { loggedAt: "desc" } },
      salesRecord: true,
    },
  });
}
