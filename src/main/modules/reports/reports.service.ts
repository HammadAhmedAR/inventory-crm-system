import type { Prisma, PrismaClient } from "@prisma/client";
import type { ReportFilterPayload, ReportRow } from "../../../shared/ipc";

function dateRange(payload: ReportFilterPayload): { gte: Date; lte: Date } {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  if (payload.timeframe === "TODAY") {
    start.setHours(0, 0, 0, 0);
  } else if (payload.timeframe === "THIS_WEEK") {
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else if (payload.timeframe === "THIS_MONTH") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    if (!payload.startDate || !payload.endDate) throw new Error("A start and end date are required for a custom range.");
    start = new Date(`${payload.startDate}T00:00:00`);
    end = new Date(`${payload.endDate}T23:59:59.999`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) throw new Error("Invalid custom date range.");
  }
  if (payload.timeframe !== "CUSTOM") end.setHours(23, 59, 59, 999);
  return { gte: start, lte: end };
}

const clean = (value?: string) => value?.trim() || undefined;
const iso = (value: Date) => value.toISOString().slice(0, 10);

export async function queryReportRows(prisma: PrismaClient, payload: ReportFilterPayload): Promise<ReportRow[]> {
  const range = dateRange(payload);
  const make = clean(payload.make);
  const modelName = clean(payload.model);
  const bodyType = clean(payload.bodyType)?.toUpperCase();
  const status = clean(payload.status)?.toUpperCase();

  if (payload.reportType === "INVENTORY") {
    const where: Prisma.VehicleChassisWhereInput = { createdAt: range, deletedAt: null };
    if (status) where.saleStatus = status;
    if (make || modelName || bodyType) where.model = { is: { ...(make ? { make } : {}), ...(modelName ? { modelName } : {}), ...(bodyType ? { bodyType } : {}) } };
    const records = await prisma.vehicleChassis.findMany({ where, include: { model: true }, orderBy: { createdAt: "desc" } });
    return records.map((r) => ({ Chassis: r.chassisNumber, Engine: r.engineNumber, Make: r.model.make, Model: r.model.modelName, Year: r.model.year, "Body Type": r.model.bodyType, Color: r.color, "Sale Status": r.saleStatus, "Health Status": r.healthStatus, "Quoting Price": r.baseQuotingPrice, "Cost Price": r.costPrice, "Added Date": iso(r.createdAt) }));
  }

  if (payload.reportType === "CRM") {
    const where: Prisma.CustomerWhereInput = { createdAt: range, deletedAt: null };
    if (clean(payload.leadSource)) where.leadSource = payload.leadSource!.trim().toUpperCase();
    if (clean(payload.pipelineStage) || status) where.pipelineStage = (clean(payload.pipelineStage) ?? status)!.toUpperCase();
    const records = await prisma.customer.findMany({ where, include: { quotes: { take: 1, orderBy: { createdAt: "desc" }, include: { chassis: { include: { model: true } } } } }, orderBy: { createdAt: "desc" } });
    return records.filter((r) => {
      const vehicle = r.quotes[0]?.chassis.model;
      return (!make || vehicle?.make === make) && (!modelName || vehicle?.modelName === modelName) && (!bodyType || vehicle?.bodyType === bodyType);
    }).map((r) => ({ Name: r.fullName, Phone: r.phone, Email: r.email, "Lead Source": r.leadSource, "Pipeline Stage": r.pipelineStage, "Interested Vehicle": r.quotes[0] ? `${r.quotes[0].chassis.model.make} ${r.quotes[0].chassis.model.modelName}` : null, "Latest Quote": r.quotes[0]?.quotedPrice ?? null, "Created Date": iso(r.createdAt) }));
  }

  if (payload.reportType === "SALES") {
    const where: Prisma.VehicleSaleWhereInput = { saleDate: range };
    if (make || modelName || bodyType || status) where.chassis = { is: { ...(status ? { saleStatus: status } : {}), ...((make || modelName || bodyType) ? { model: { is: { ...(make ? { make } : {}), ...(modelName ? { modelName } : {}), ...(bodyType ? { bodyType } : {}) } } } : {}) } };
    const records = await prisma.vehicleSale.findMany({ where, include: { customer: true, chassis: { include: { model: true } } }, orderBy: { saleDate: "desc" } });
    return records.map((r) => ({ "Sale Date": iso(r.saleDate), Chassis: r.chassisNumber, Make: r.chassis.model.make, Model: r.chassis.model.modelName, "Body Type": r.chassis.model.bodyType, Customer: r.customer.fullName, Phone: r.customer.phone, "Sale Price": r.finalSalePrice, "Cost Price": r.chassis.costPrice, Profit: r.chassis.costPrice == null ? null : r.finalSalePrice - r.chassis.costPrice, Payment: r.paymentMethod }));
  }

  const records = await prisma.dailyExpense.findMany({ where: { expenseDate: range, deletedAt: null, ...(status ? { category: status } : {}) }, orderBy: { expenseDate: "desc" } });
  return records.map((r) => ({ "Expense Date": iso(r.expenseDate), Category: r.category, Description: r.description, Amount: r.amount, "Logged By": r.loggedBy }));
}
