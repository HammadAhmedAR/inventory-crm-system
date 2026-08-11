import { dialog, ipcMain } from "electron";
import { writeFile } from "fs/promises";
import type { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import type { ReportFilterPayload, ReportRow } from "../../../shared/ipc";
import { queryReportRows } from "./reports.service";

function csvCell(value: ReportRow[string]) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function csvBuffer(rows: ReportRow[]) {
  if (!rows.length) return Buffer.from("\uFEFF", "utf8");
  const headers = Object.keys(rows[0]);
  const text = [headers.map(csvCell).join(","), ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(","))].join("\r\n");
  return Buffer.from(`\uFEFF${text}`, "utf8");
}

export function registerReportsIpcHandlers(prisma: PrismaClient) {
  ipcMain.handle("reports:preview", async (_, payload: ReportFilterPayload) => (await queryReportRows(prisma, payload)).slice(0, 10));
  ipcMain.handle("reports:export-file", async (_, payload: ReportFilterPayload) => {
    const rows = await queryReportRows(prisma, payload);
    const format = payload.format === "CSV" ? "CSV" : "XLSX";
    const extension = format.toLowerCase();
    const year = new Date().getFullYear();
    const result = await dialog.showSaveDialog({
      title: "Export OmniDrive report",
      defaultPath: `OmniDrive_${payload.reportType}_Report_${year}.${extension}`,
      filters: [{ name: format === "CSV" ? "CSV file" : "Excel workbook", extensions: [extension] }],
    });
    if (result.canceled || !result.filePath) return { success: false, canceled: true };
    const buffer = format === "CSV" ? csvBuffer(rows) : XLSX.write({ SheetNames: ["Report"], Sheets: { Report: XLSX.utils.json_to_sheet(rows) } }, { type: "buffer", bookType: "xlsx" });
    await writeFile(result.filePath, buffer);
    return { success: true, filePath: result.filePath, recordCount: rows.length };
  });
}
