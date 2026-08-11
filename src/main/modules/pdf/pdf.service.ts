import { app, BrowserWindow } from "electron";
import type { PrismaClient } from "@prisma/client";
import { join } from "path";
import { promises as fs } from "fs";

export type AgreementPayload = { agreementId: string; chassisNumber: string; customerId: string; salePrice: number; paymentMethod: string; notes?: string };
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]!);
const money = (value: number) => new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(value);

export async function generateAgreementPdf(prisma: PrismaClient, input: AgreementPayload) {
  const [customer, chassis, profile] = await Promise.all([
    prisma.customer.findUnique({ where: { id: input.customerId } }),
    prisma.vehicleChassis.findUnique({ where: { chassisNumber: input.chassisNumber }, include: { model: true } }),
    prisma.dealershipProfile.findFirst(),
  ]);
  if (!customer || !chassis) throw new Error("Customer or chassis record was not found.");
  const salePrice = Number(input.salePrice);
  if (!Number.isFinite(salePrice) || salePrice <= 0) throw new Error("A valid sale price is required.");
  const companyName = profile?.companyName || "OmniDrive";
  const companyContact = [profile?.regNumber, profile?.address, profile?.phone, profile?.email, profile?.website].filter(Boolean).join(" · ");
  const bankSection = profile && [profile.bankName, profile.bankBranch, profile.accountName, profile.accountNumber].some(Boolean) ? `<div class="section"><h2>DEALERSHIP BANK DETAILS</h2><div class="grid"><div><div class="label">Bank</div><div class="value">${escapeHtml(profile.bankName)}</div></div><div><div class="label">Branch</div><div class="value">${escapeHtml(profile.bankBranch)}</div></div><div><div class="label">Account name</div><div class="value">${escapeHtml(profile.accountName)}</div></div><div><div class="label">Account number</div><div class="value">${escapeHtml(profile.accountNumber)}</div></div></div></div>` : "";

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:18mm}body{font-family:Arial,sans-serif;color:#172033;font-size:12px;line-height:1.5}h1{text-align:center;font-size:20px;letter-spacing:1px;margin:12px 0 5px}.dealer{text-align:center;font-size:15px;font-weight:700}.meta{text-align:center;color:#667085;margin-bottom:24px}.section{margin:18px 0}.section h2{font-size:12px;letter-spacing:1px;border-bottom:2px solid #d5a928;padding-bottom:5px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 30px}.label{color:#667085;font-size:10px;text-transform:uppercase}.value{font-weight:700}.terms{padding-left:18px}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:70px}.signature{border-top:1px solid #172033;padding-top:8px}.footer{position:fixed;bottom:0;text-align:center;width:100%;font-size:9px;color:#98a2b3}</style></head><body>
    <div class="dealer">${escapeHtml(companyName)}</div><div class="meta">${escapeHtml(companyContact)}</div><h1>VEHICLE SALES &amp; HANDOVER AGREEMENT</h1><div class="meta">Agreement ${escapeHtml(input.agreementId)} · ${new Date().toLocaleDateString("en-LK")}</div>
    <div class="section"><h2>CUSTOMER DETAILS</h2><div class="grid"><div><div class="label">Full name</div><div class="value">${escapeHtml(customer.fullName)}</div></div><div><div class="label">Telephone</div><div class="value">${escapeHtml(customer.phone)}</div></div><div><div class="label">Email</div><div class="value">${escapeHtml(customer.email || "Not provided")}</div></div><div><div class="label">Customer ID</div><div class="value">${escapeHtml(customer.id)}</div></div></div></div>
    <div class="section"><h2>VEHICLE CHASSIS &amp; SPECIFICATION</h2><div class="grid"><div><div class="label">Chassis / VIN</div><div class="value">${escapeHtml(chassis.chassisNumber)}</div></div><div><div class="label">Engine number</div><div class="value">${escapeHtml(chassis.engineNumber || "N/A")}</div></div><div><div class="label">Vehicle</div><div class="value">${escapeHtml(`${chassis.model.make} ${chassis.model.modelName} ${chassis.model.year}`)}</div></div><div><div class="label">Colour</div><div class="value">${escapeHtml(chassis.color)}</div></div></div></div>
    <div class="section"><h2>PAYMENT BREAKDOWN</h2><div class="grid"><div><div class="label">Final agreed price</div><div class="value">${escapeHtml(money(salePrice))}</div></div><div><div class="label">Payment method</div><div class="value">${escapeHtml(input.paymentMethod.replace(/_/g, " "))}</div></div></div>${input.notes ? `<p><span class="label">Notes:</span> ${escapeHtml(input.notes)}</p>` : ""}</div>
    ${bankSection}<div class="section"><h2>TERMS &amp; CONDITIONS</h2><ol class="terms"><li>The buyer confirms inspection and acceptance of the vehicle in its present condition.</li><li>Ownership and risk transfer upon cleared payment and physical handover.</li><li>The buyer and seller confirm that the chassis and payment details above are accurate.</li><li>Both parties agree to complete all applicable DMT/MTA transfer formalities.</li></ol></div>
    <div class="signatures"><div class="signature">Buyer signature / Date<br>${escapeHtml(customer.fullName)}</div><div class="signature">Authorised dealer signature / Date<br>${escapeHtml(companyName)}</div></div><div class="footer">${escapeHtml([companyName, profile?.phone, profile?.email].filter(Boolean).join(" · "))}</div>
  </body></html>`;

  const pdfWindow = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
  try {
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    const buffer = await pdfWindow.webContents.printToPDF({ printBackground: true, pageSize: "A4" });
    const safeId = input.agreementId.replace(/[^a-z0-9_-]/gi, "-");
    const filePath = join(app.getPath("documents"), `OmniDrive-${safeId}.pdf`);
    await fs.writeFile(filePath, buffer);
    return { filePath };
  } finally { pdfWindow.destroy(); }
}

export async function generatePriceQuotePdf(prisma: PrismaClient, quoteId: string) {
  const [quote, profile] = await Promise.all([
    prisma.prospectQuote.findUnique({ where: { id: quoteId }, include: { customer: true, chassis: { include: { model: true } } } }),
    prisma.dealershipProfile.findFirst(),
  ]);
  if (!quote) throw new Error("Quote was not found.");
  const companyName = profile?.companyName || "OmniDrive";
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:20mm}body{font-family:Arial;color:#172033;font-size:12px}.head{text-align:center;border-bottom:3px solid #d5a928;padding-bottom:18px}h1{letter-spacing:2px}.contact{color:#667085}.section{margin-top:25px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.label{font-size:10px;text-transform:uppercase;color:#667085}.value{font-size:14px;font-weight:bold}.price{margin:30px 0;padding:20px;background:#f8f4e8;text-align:center;font-size:24px;font-weight:bold}.bank{border:1px solid #d0d5dd;padding:15px}.footer{position:fixed;bottom:0;width:100%;text-align:center;color:#98a2b3;font-size:9px}</style></head><body><div class="head"><h2>${escapeHtml(companyName)}</h2><div class="contact">${escapeHtml([profile?.regNumber, profile?.address, profile?.phone, profile?.email, profile?.website].filter(Boolean).join(" · "))}</div><h1>VEHICLE PRICE QUOTATION</h1><div>Quote ${escapeHtml(quote.id)} · ${quote.createdAt.toLocaleDateString("en-LK")}</div></div><div class="section grid"><div><div class="label">Prepared for</div><div class="value">${escapeHtml(quote.customer.fullName)}</div><div>${escapeHtml(quote.customer.phone)}</div><div>${escapeHtml(quote.customer.email)}</div></div><div><div class="label">Vehicle</div><div class="value">${escapeHtml(`${quote.chassis.model.make} ${quote.chassis.model.modelName} ${quote.chassis.model.year}`)}</div><div>Chassis: ${escapeHtml(quote.chassisNumber)}</div><div>Colour: ${escapeHtml(quote.chassis.color)}</div></div></div><div class="price">Quoted Price: ${escapeHtml(money(quote.quotedPrice))}</div>${profile && [profile.bankName, profile.bankBranch, profile.accountName, profile.accountNumber].some(Boolean) ? `<div class="bank"><strong>Payment Details</strong><div>${escapeHtml(profile.bankName)} ${escapeHtml(profile.bankBranch)}</div><div>${escapeHtml(profile.accountName)} · ${escapeHtml(profile.accountNumber)}</div></div>` : ""}<div class="footer">Generated by ${escapeHtml(companyName)} · This quotation is subject to vehicle availability.</div></body></html>`;
  const pdfWindow = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
  try {
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    const buffer = await pdfWindow.webContents.printToPDF({ printBackground: true, pageSize: "A4" });
    const filePath = join(app.getPath("documents"), `OmniDrive-Quote-${quote.id.replace(/[^a-z0-9_-]/gi, "-")}.pdf`);
    await fs.writeFile(filePath, buffer);
    return { filePath };
  } finally { pdfWindow.destroy(); }
}
