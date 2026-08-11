const statusList = ["READY_FOR_SALE", "UNDER_REPAIR", "NEEDS_REPAIR", "PENDING_CHECK"];
const saleStatusList = ["AVAILABLE", "RESERVED", "SOLD"];
const repairStatusList = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const issueCategoryList = ["MECHANICAL", "ELECTRICAL", "BODYWORK", "DETAILING"];
function toNumber(value) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}
function buildInventoryWhere(filters = {}) {
    const where = {};
    if (filters.status) {
        const normalized = filters.status.toUpperCase();
        if (["AVAILABLE", "RESERVED", "SOLD"].includes(normalized)) {
            where.saleStatus = normalized;
        }
        else if (normalized === "READY_FOR_SALE") {
            where.healthStatus = "READY_FOR_SALE";
        }
        else if (normalized === "REPAIR") {
            where.healthStatus = {
                in: ["UNDER_REPAIR", "NEEDS_REPAIR", "PENDING_CHECK"],
            };
        }
        else if (statusList.includes(normalized)) {
            where.healthStatus = normalized;
        }
    }
    if (filters.search?.trim()) {
        const query = filters.search.trim();
        where.OR = [
            { chassisNumber: { contains: query } },
            { color: { contains: query } },
            { model: { is: { make: { contains: query } } } },
            { model: { is: { modelName: { contains: query } } } },
        ];
    }
    return where;
}
export async function getInventoryUnits(prisma, filters = {}) {
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
export async function updateChassisStatus(prisma, data) {
    const current = await prisma.vehicleChassis.findUnique({
        where: { chassisNumber: data.chassisNumber },
    });
    if (!current) {
        throw new Error(`Vehicle ${data.chassisNumber} was not found.`);
    }
    const nextSaleStatus = data.saleStatus?.toUpperCase() ?? current.saleStatus;
    const nextHealthStatus = data.healthStatus?.toUpperCase() ?? current.healthStatus;
    if (!saleStatusList.includes(nextSaleStatus)) {
        throw new Error(`Invalid sale status: ${nextSaleStatus}.`);
    }
    if (!statusList.includes(nextHealthStatus)) {
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
export async function logRepairIssue(prisma, data) {
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
    if (!issueCategoryList.includes(issueCategory)) {
        throw new Error(`Invalid repair category: ${issueCategory}.`);
    }
    if (!repairStatusList.includes(repairStatus)) {
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
export async function updateCustodyChecklist(prisma, data) {
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
