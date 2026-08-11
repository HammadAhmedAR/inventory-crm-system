import type { DealershipProfile, PrismaClient } from "@prisma/client";

export type DealershipProfileInput = Omit<DealershipProfile, "id">;
const fields: Array<keyof DealershipProfileInput> = ["companyName", "regNumber", "address", "phone", "email", "website", "bankName", "bankBranch", "accountName", "accountNumber"];

export async function getDealershipProfile(prisma: PrismaClient) {
  return prisma.dealershipProfile.findFirst({ orderBy: { id: "asc" } });
}

export async function updateDealershipProfile(prisma: PrismaClient, input: DealershipProfileInput) {
  const data = Object.fromEntries(fields.map((key) => [key, String(input?.[key] ?? "").trim()])) as DealershipProfileInput;
  if (!data.companyName) throw new Error("Company name is required.");
  const existing = await getDealershipProfile(prisma);
  return existing
    ? prisma.dealershipProfile.update({ where: { id: existing.id }, data })
    : prisma.dealershipProfile.create({ data });
}
