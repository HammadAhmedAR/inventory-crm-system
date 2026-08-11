import { createHash, timingSafeEqual } from "crypto";
import { ipcMain } from "electron";
import type { PrismaClient } from "@prisma/client";

const digest = (value: string) => createHash("sha256").update(value).digest();
const matchesPassword = (password: string, stored: string) => {
  const expected = /^[a-f\d]{64}$/i.test(stored) ? Buffer.from(stored, "hex") : digest(stored);
  const actual = digest(password);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

export function registerAuthIpcHandlers(prisma: PrismaClient) {
  ipcMain.handle("auth:login", async (_, input: { username: string; password: string }) => {
    const username = String(input?.username ?? "").trim();
    const password = String(input?.password ?? "");
    if (!username || !password) throw new Error("Username and password are required.");
    const account = await prisma.userAccount.findUnique({ where: { username } });
    if (!account || !account.isActive || !matchesPassword(password, account.passwordHash)) throw new Error("Invalid username or password.");
    return { id: account.id, username: account.username, fullName: account.fullName, role: account.role };
  });

  ipcMain.handle("auth:change-password", async (_, input: { userId: string; currentPassword: string; newPassword: string }) => {
    const currentPassword = String(input?.currentPassword ?? "");
    const newPassword = String(input?.newPassword ?? "");
    if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");
    const account = await prisma.userAccount.findUnique({ where: { id: String(input?.userId ?? "") } });
    if (!account || !account.isActive || !matchesPassword(currentPassword, account.passwordHash)) return false;
    await prisma.userAccount.update({ where: { id: account.id }, data: { passwordHash: digest(newPassword).toString("hex") } });
    return true;
  });
}
