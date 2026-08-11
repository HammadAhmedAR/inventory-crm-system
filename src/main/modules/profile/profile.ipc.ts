import { ipcMain } from "electron";
import type { PrismaClient } from "@prisma/client";
import { getDealershipProfile, updateDealershipProfile, type DealershipProfileInput } from "./profile.service";

export function registerProfileIpcHandlers(prisma: PrismaClient) {
  ipcMain.handle("profile:get", () => getDealershipProfile(prisma));
  ipcMain.handle("profile:update", (_, data: DealershipProfileInput) => updateDealershipProfile(prisma, data));
}
