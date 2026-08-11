import { PrismaClient } from "@prisma/client";
import { ipcMain } from "electron";
import {
  getInventoryUnits,
  createInventoryUnit,
  logRepairIssue,
  updateChassisStatus,
  updateCustodyChecklist,
} from "./inventory.service";

export function registerInventoryIpcHandlers(prisma: PrismaClient) {
  ipcMain.handle("inventory:get-all", async (_, filters = {}) => {
    return getInventoryUnits(prisma, filters);
  });

  ipcMain.handle("inventory:update-status", async (_, data) => {
    return updateChassisStatus(prisma, data);
  });

  ipcMain.handle("inventory:log-repair", async (_, data) => {
    return logRepairIssue(prisma, data);
  });

  ipcMain.handle("inventory:update-custody", async (_, data) => {
    return updateCustodyChecklist(prisma, data);
  });

  ipcMain.handle("inventory:add-unit", async (_, data) => createInventoryUnit(prisma, data));
}
