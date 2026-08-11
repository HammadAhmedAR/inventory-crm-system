import { ipcMain } from "electron";
import type { PrismaClient } from "@prisma/client";
import type { CreateProspectPayload } from "../../../shared/ipc";
import { createProspect } from "./crm.service";

const STAGES = ["NEW_LEAD", "CONTACTED", "TEST_DRIVE", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"] as const;
const LOST_REASONS = ["PRICE_TOO_HIGH", "BOUGHT_COMPETITOR", "SPEC_COLOR_OBJECTION", "FINANCE_REJECTED", "POSTPONED_NO_RESPONSE", "OTHER"] as const;
export function registerCrmPipelineIpcHandlers(prisma: PrismaClient) {
  ipcMain.handle("crm:add-prospect", (_, input: CreateProspectPayload) => createProspect(prisma, input));

  ipcMain.handle("crm:update-pipeline-stage", async (_, input: { customerId: string; pipelineStage: string; lostReason?: string; lostReasonNotes?: string }) => {
    const stage = input.pipelineStage.toUpperCase();
    if (!STAGES.includes(stage as (typeof STAGES)[number])) throw new Error("Invalid pipeline stage.");
    if (stage === "CLOSED_LOST" && !LOST_REASONS.includes(input.lostReason as (typeof LOST_REASONS)[number])) throw new Error("A valid lost-lead reason is required.");
    return prisma.customer.update({ where: { id: input.customerId }, data: { pipelineStage: stage, lostReason: stage === "CLOSED_LOST" ? input.lostReason : null, lostReasonNotes: stage === "CLOSED_LOST" ? input.lostReasonNotes?.trim() || null : null } });
  });
}
