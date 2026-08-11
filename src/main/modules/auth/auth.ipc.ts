import { createHash, timingSafeEqual } from "crypto";
import { ipcMain } from "electron";
import type { PrismaClient } from "@prisma/client";

const digest = (value: string) => createHash("sha256").update(value).digest();

export function registerAuthIpcHandlers(prisma: PrismaClient) {
  ipcMain.handle("auth:verify-pin", async (_, pin: string) => {
    if (!/^\d{4}$/.test(pin)) return false;
    const accounts = await prisma.userAccount.findMany({ where: { isActive: true }, select: { pinHash: true } });
    const candidates = accounts.length ? accounts.map((account) => account.pinHash) : ["1234"];
    return candidates.some((stored) => {
      const expected = /^[a-f\d]{64}$/i.test(stored) ? Buffer.from(stored, "hex") : digest(stored);
      const actual = digest(pin);
      return expected.length === actual.length && timingSafeEqual(expected, actual);
    });
  });
}
