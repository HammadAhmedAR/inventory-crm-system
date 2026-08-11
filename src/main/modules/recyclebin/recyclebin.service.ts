import type { PrismaClient } from "@prisma/client";
import type { RecycleBinItem, RecycleEntityType } from "../../../shared/ipc";

export async function softDelete(prisma: PrismaClient, entityType: RecycleEntityType, id: string) {
  const data = { deletedAt: new Date() };
  if (entityType === "VEHICLE") return prisma.vehicleChassis.update({ where: { chassisNumber: id }, data });
  if (entityType === "CUSTOMER") return prisma.customer.update({ where: { id }, data });
  if (entityType === "TASK") return prisma.followUpTask.update({ where: { id }, data });
  return prisma.dailyExpense.update({ where: { id }, data });
}

export async function restoreDeleted(prisma: PrismaClient, entityType: RecycleEntityType, id: string) {
  const data = { deletedAt: null };
  if (entityType === "VEHICLE") return prisma.vehicleChassis.update({ where: { chassisNumber: id }, data });
  if (entityType === "CUSTOMER") return prisma.customer.update({ where: { id }, data });
  if (entityType === "TASK") return prisma.followUpTask.update({ where: { id }, data });
  return prisma.dailyExpense.update({ where: { id }, data });
}

export async function getDeleted(prisma: PrismaClient, entityType?: RecycleEntityType): Promise<RecycleBinItem[]> {
  const include = (type: RecycleEntityType) => !entityType || entityType === type;
  const [vehicles, customers, tasks, expenses] = await Promise.all([
    include("VEHICLE") ? prisma.vehicleChassis.findMany({ where: { deletedAt: { not: null } }, include: { model: true } }) : [],
    include("CUSTOMER") ? prisma.customer.findMany({ where: { deletedAt: { not: null } } }) : [],
    include("TASK") ? prisma.followUpTask.findMany({ where: { deletedAt: { not: null } } }) : [],
    include("EXPENSE") ? prisma.dailyExpense.findMany({ where: { deletedAt: { not: null } } }) : [],
  ]);
  return [
    ...vehicles.map((x) => ({ id: x.chassisNumber, entityType: "VEHICLE" as const, title: x.chassisNumber, subtitle: `${x.model.make} ${x.model.modelName} ${x.model.year}`, detail: `${x.color} · ${x.saleStatus}`, deletedAt: x.deletedAt!.toISOString(), originalDate: x.createdAt.toISOString() })),
    ...customers.map((x) => ({ id: x.id, entityType: "CUSTOMER" as const, title: x.fullName, subtitle: x.phone, detail: `${x.leadSource.replace(/_/g, " ")} · ${x.pipelineStage.replace(/_/g, " ")}`, deletedAt: x.deletedAt!.toISOString(), originalDate: x.createdAt.toISOString() })),
    ...tasks.map((x) => ({ id: x.id, entityType: "TASK" as const, title: x.title, subtitle: `${x.taskType.replace(/_/g, " ")} · ${x.priority}`, detail: x.notes || x.actionType.replace(/_/g, " "), deletedAt: x.deletedAt!.toISOString(), originalDate: x.dueDate.toISOString() })),
    ...expenses.map((x) => ({ id: x.id, entityType: "EXPENSE" as const, title: x.category.replace(/_/g, " "), subtitle: `LKR ${x.amount.toLocaleString("en-LK")}`, detail: x.description, deletedAt: x.deletedAt!.toISOString(), originalDate: x.expenseDate.toISOString() })),
  ].sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

async function purgeOne(prisma: PrismaClient, entityType: RecycleEntityType, id: string) {
  if (entityType === "TASK") return prisma.followUpTask.delete({ where: { id, deletedAt: { not: null } } });
  if (entityType === "EXPENSE") return prisma.dailyExpense.delete({ where: { id, deletedAt: { not: null } } });
  if (entityType === "CUSTOMER") return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findFirst({ where: { id, deletedAt: { not: null } } }); if (!customer) throw new Error("Deleted customer was not found.");
    await tx.followUpTask.deleteMany({ where: { customerId: id } }); await tx.customerInteraction.deleteMany({ where: { customerId: id } }); await tx.prospectQuote.deleteMany({ where: { customerId: id } }); await tx.vehicleSale.deleteMany({ where: { customerId: id } });
    return tx.customer.delete({ where: { id } });
  });
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicleChassis.findFirst({ where: { chassisNumber: id, deletedAt: { not: null } } }); if (!vehicle) throw new Error("Deleted vehicle was not found.");
    await tx.followUpTask.deleteMany({ where: { chassisNumber: id } }); await tx.prospectQuote.deleteMany({ where: { chassisNumber: id } }); await tx.vehicleRepairLog.deleteMany({ where: { chassisNumber: id } }); await tx.vehicleSale.deleteMany({ where: { chassisNumber: id } });
    return tx.vehicleChassis.delete({ where: { chassisNumber: id } });
  });
}

export const permanentlyDelete = purgeOne;

export async function emptyRecycleBin(prisma: PrismaClient) {
  const items = await getDeleted(prisma);
  for (const type of ["TASK", "EXPENSE", "CUSTOMER", "VEHICLE"] as RecycleEntityType[]) {
    for (const item of items.filter((x) => x.entityType === type)) await purgeOne(prisma, type, item.id);
  }
  return { deletedCount: items.length };
}
