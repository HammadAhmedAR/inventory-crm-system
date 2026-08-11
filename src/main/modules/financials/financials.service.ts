import type { PrismaClient } from "@prisma/client";

const EXPENSE_CATEGORIES = [
  "SHOWROOM_MAINTENANCE", "UTILITIES", "TRANSPORT", "TEA_HOSPITALITY", "MARKETING", "MISC",
] as const;
const PAYMENT_METHODS = ["CASH", "LEASING", "BANK_TRANSFER", "CHEQUE"] as const;

export async function logExpense(prisma: PrismaClient, input: {
  category: string; description: string; amount: number; loggedBy?: string;
}) {
  const category = input.category.toUpperCase();
  const amount = Number(input.amount);
  if (!EXPENSE_CATEGORIES.includes(category as (typeof EXPENSE_CATEGORIES)[number])) throw new Error("Invalid expense category.");
  if (!input.description.trim()) throw new Error("Expense description is required.");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Expense amount must be greater than zero.");
  return prisma.dailyExpense.create({ data: { category, description: input.description.trim(), amount, loggedBy: input.loggedBy?.trim() || "Admin" } });
}

export async function recordSale(prisma: PrismaClient, input: {
  customerId: string; chassisNumber: string; finalSalePrice: number; paymentMethod: string; notes?: string;
}) {
  const price = Number(input.finalSalePrice);
  const method = input.paymentMethod.toUpperCase();
  if (!Number.isFinite(price) || price <= 0) throw new Error("Final sale price must be greater than zero.");
  if (!PAYMENT_METHODS.includes(method as (typeof PAYMENT_METHODS)[number])) throw new Error("Invalid payment method.");

  return prisma.$transaction(async (tx) => {
    const [customer, chassis] = await Promise.all([
      tx.customer.findUnique({ where: { id: input.customerId } }),
      tx.vehicleChassis.findUnique({ where: { chassisNumber: input.chassisNumber } }),
    ]);
    if (!customer) throw new Error("Customer was not found.");
    if (!chassis) throw new Error("Chassis unit was not found.");
    if (!['AVAILABLE', 'RESERVED'].includes(chassis.saleStatus)) throw new Error("Only available or reserved units can be sold.");

    const sale = await tx.vehicleSale.create({
      data: { customerId: input.customerId, chassisNumber: input.chassisNumber, finalSalePrice: price, paymentMethod: method, notes: input.notes?.trim() || null },
      include: { customer: true, chassis: { include: { model: true } } },
    });
    await tx.vehicleChassis.update({ where: { chassisNumber: input.chassisNumber }, data: { saleStatus: "SOLD" } });
    await tx.customer.update({ where: { id: input.customerId }, data: { pipelineStage: "CLOSED_WON", lostReason: null, lostReasonNotes: null } });
    await tx.prospectQuote.updateMany({ where: { customerId: input.customerId, chassisNumber: input.chassisNumber, status: "ACTIVE" }, data: { status: "ACCEPTED" } });
    return sale;
  });
}
