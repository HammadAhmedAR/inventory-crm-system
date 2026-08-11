import { ipcMain } from "electron";
import type { PrismaClient } from "@prisma/client";
import { logExpense, recordSale } from "./financials.service";

export function registerFinancialsIpcHandlers(prisma: PrismaClient) {
  ipcMain.handle("financials:log-expense", (_, data) => logExpense(prisma, data));
  ipcMain.handle("financials:record-sale", (_, data) => recordSale(prisma, data));
  ipcMain.handle("financials:get-daily-expenses", () => prisma.dailyExpense.findMany({ where: { deletedAt: null }, orderBy: { expenseDate: "desc" } }));
}
