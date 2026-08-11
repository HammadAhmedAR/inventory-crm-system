import { ipcMain } from "electron";
import type { PrismaClient } from "@prisma/client";
import type { RecycleEntityType } from "../../../shared/ipc";
import { emptyRecycleBin, getDeleted, permanentlyDelete, restoreDeleted, softDelete } from "./recyclebin.service";

const valid = new Set<RecycleEntityType>(["VEHICLE", "CUSTOMER", "TASK", "EXPENSE"]);
const parse = (input: { entityType: RecycleEntityType; id: string }) => { if (!valid.has(input?.entityType) || !input?.id) throw new Error("Invalid recycle-bin item."); return input; };
export function registerRecycleBinIpcHandlers(prisma: PrismaClient) {
  ipcMain.handle("recyclebin:get-deleted", (_, entityType?: RecycleEntityType) => getDeleted(prisma, entityType));
  ipcMain.handle("recyclebin:soft-delete", (_, input) => { const x = parse(input); return softDelete(prisma, x.entityType, x.id); });
  ipcMain.handle("recyclebin:restore", (_, input) => { const x = parse(input); return restoreDeleted(prisma, x.entityType, x.id); });
  ipcMain.handle("recyclebin:permanent-delete", (_, input) => { const x = parse(input); return permanentlyDelete(prisma, x.entityType, x.id); });
  ipcMain.handle("recyclebin:empty-bin", () => emptyRecycleBin(prisma));
}
