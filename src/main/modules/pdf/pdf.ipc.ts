import { ipcMain, shell } from "electron";
import type { PrismaClient } from "@prisma/client";
import { generateAgreementPdf, generatePriceQuotePdf } from "./pdf.service";

export function registerPdfIpcHandlers(prisma: PrismaClient) {
  ipcMain.handle("agreements:generate-pdf", (_, data) => generateAgreementPdf(prisma, data));
  ipcMain.handle("agreements:open-pdf", async (_, filePath: string) => {
    const error = await shell.openPath(filePath);
    if (error) throw new Error(error);
  });
  ipcMain.handle("quotes:generate-pdf", (_, quoteId: string) => generatePriceQuotePdf(prisma, quoteId));
}
