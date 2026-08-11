import { ipcMain } from "electron";
import type { PrismaClient } from "@prisma/client";
import type { CreateTaskPayload, TaskFilters } from "../../../shared/ipc";

const actions = ["CALL", "WHATSAPP", "REPAIR_DISPATCH", "DOCUMENT_CHECK", "VISIT"];
const taskTypes = ["SALES", "INVENTORY_REPAIR", "DOCUMENT_CHECK"];
const priorities = ["HIGH", "MEDIUM", "LOW"];
const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export function registerTaskIpcHandlers(prisma: PrismaClient) {
  ipcMain.handle("tasks:get-all", async (_, filters: TaskFilters = {}) => {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.timeline === "COMPLETED") where.status = "COMPLETED";
    else if (filters.timeline === "OVERDUE") { where.status = { not: "COMPLETED" }; where.dueDate = { lt: todayStart }; }
    else if (filters.timeline === "TODAY") { where.status = { not: "COMPLETED" }; where.dueDate = { gte: todayStart, lte: todayEnd }; }
    else if (filters.timeline === "UPCOMING") { where.status = { not: "COMPLETED" }; where.dueDate = { gt: todayEnd }; }
    if (filters.category === "SALES") where.taskType = "SALES";
    else if (filters.category === "INVENTORY") where.taskType = { in: ["INVENTORY_REPAIR", "DOCUMENT_CHECK"] };
    return (prisma.followUpTask as any).findMany({
      where,
      include: {
        customer: { include: { quotes: { take: 1, orderBy: { createdAt: "desc" }, include: { chassis: { include: { model: true } } } } } },
        chassis: { include: { model: true, repairs: { take: 1, orderBy: { loggedAt: "desc" } } } },
      },
      orderBy: [{ dueDate: "asc" }, { dueTime: "asc" }, { createdAt: "desc" }],
    });
  });

  ipcMain.handle("tasks:create", async (_, input: CreateTaskPayload) => {
    if (!input.customerId && !input.chassisNumber) throw new Error("Select a customer or vehicle for this task.");
    if (!input.title?.trim()) throw new Error("Task title is required.");
    if (!actions.includes(input.actionType) || !taskTypes.includes(input.taskType) || !priorities.includes(input.priority)) throw new Error("Invalid task configuration.");
    const dueDate = new Date(`${input.dueDate}T00:00:00`);
    if (Number.isNaN(dueDate.getTime())) throw new Error("A valid due date is required.");
    return (prisma.followUpTask as any).create({ data: { customerId: input.customerId || null, chassisNumber: input.chassisNumber || null, title: input.title.trim(), actionType: input.actionType, taskType: input.taskType, priority: input.priority, dueDate, dueTime: input.dueTime?.trim() || null, notes: input.notes?.trim() || null }, include: { customer: true, chassis: { include: { model: true, repairs: true } } } });
  });

  ipcMain.handle("tasks:update-status", async (_, input: { taskId: string; status: string }) => {
    const status = input.status.toUpperCase();
    if (!statuses.includes(status)) throw new Error("Invalid task status.");
    return (prisma.followUpTask as any).update({ where: { id: input.taskId }, data: { status } });
  });
}
