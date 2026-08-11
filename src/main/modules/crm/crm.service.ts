import type { PrismaClient } from "@prisma/client";
import type { CreateProspectPayload } from "../../../shared/ipc";

const INITIAL_STAGES = ["NEW_LEAD", "CONTACTED", "TEST_DRIVE", "NEGOTIATION"] as const;
const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  if (digits.length === 9) return `94${digits}`;
  return digits;
};

export async function createProspect(prisma: PrismaClient, payload: CreateProspectPayload) {
  const fullName = payload.fullName.trim();
  const phone = normalizePhone(payload.phone);
  const stage = payload.pipelineStage.toUpperCase();
  const createdAt = payload.createdAt ? new Date(payload.createdAt) : new Date();
  if (!fullName) throw new Error("Full name is required.");
  if (phone.length < 10 || phone.length > 15) throw new Error("Enter a valid phone number.");
  if (!INITIAL_STAGES.includes(stage as (typeof INITIAL_STAGES)[number])) throw new Error("Invalid initial pipeline stage.");
  if (Number.isNaN(createdAt.getTime())) throw new Error("Enter a valid prospect entry date.");

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({ data: { fullName, phone, email: payload.email?.trim() || null, leadSource: payload.leadSource.toUpperCase(), pipelineStage: stage, estimatedCloseDate: payload.estimatedCloseDate ? new Date(payload.estimatedCloseDate) : null, createdAt } });
    if (payload.remarks?.trim()) await tx.customerInteraction.create({ data: { customerId: customer.id, customerRemark: payload.remarks.trim(), actionTag: "PROSPECT_CREATED", createdAt } });
    if (payload.chassisNumber && Number(payload.quotedPrice) > 0) await tx.prospectQuote.create({ data: { customerId: customer.id, chassisNumber: payload.chassisNumber, quotedPrice: Number(payload.quotedPrice) } });
    if (payload.estimatedCloseDate) await tx.followUpTask.create({ data: { customerId: customer.id, title: `Pipeline follow-up: ${fullName}`, actionType: "CALL", dueDate: new Date(payload.estimatedCloseDate), status: "PENDING" } });
    return customer;
  });
}
