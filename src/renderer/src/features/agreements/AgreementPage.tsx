import React, { useEffect, useMemo, useState } from "react";
import { useAgreementOptions, useGenerateAgreementPdf } from "../../hooks/useAgreementQueries";
import { formatWhatsAppUrl } from "../../lib/whatsapp";
import AgreementPreview from "./AgreementPreview";

const AgreementPage: React.FC = () => {
  const { data: options = [], isLoading, error } = useAgreementOptions(); const generate = useGenerateAgreementPdf();
  const [chassisNumber, setChassisNumber] = useState(""); const [salePrice, setSalePrice] = useState(""); const [paymentMethod, setPaymentMethod] = useState("CASH"); const [notes, setNotes] = useState(""); const [lastPdf, setLastPdf] = useState("");
  useEffect(() => { if (!chassisNumber && options[0]) setChassisNumber(options[0].chassisNumber); }, [options, chassisNumber]);
  const option = useMemo(() => options.find((x) => x.chassisNumber === chassisNumber), [options, chassisNumber]);
  const customer = option?.salesRecord?.customer ?? option?.quotes[0]?.customer;
  useEffect(() => { if (option) { setSalePrice(String(option.salesRecord?.finalSalePrice ?? option.quotes[0]?.quotedPrice ?? option.baseQuotingPrice)); setPaymentMethod(option.salesRecord?.paymentMethod ?? "CASH"); } }, [option]);
  const agreementId = `AGR-${option?.chassisNumber.replace(/[^a-z0-9]/gi, "") ?? "DRAFT"}`;
  const makePdf = async () => { if (!option || !customer) throw new Error("Select a vehicle with an assigned buyer."); const result = await generate.mutateAsync({ agreementId, chassisNumber: option.chassisNumber, customerId: customer.id, salePrice: Number(salePrice), paymentMethod, notes }); setLastPdf(result.filePath); return result.filePath; };
  if (isLoading) return <div className="p-6 text-muted">Loading agreement records...</div>;
  return <div className="h-full overflow-y-auto p-6 animate-fade-in"><div className="mb-5"><p className="text-[10px] uppercase tracking-[.2em] text-subtle">Document Center</p><h2 className="text-2xl font-bold text-white">Vehicle Handover Agreement</h2></div>
    {error && <div className="card p-4 text-red-300">Unable to load agreements.</div>}
    <div className="grid items-start gap-5 xl:grid-cols-[340px_1fr]"><aside className="card space-y-4 p-5 xl:sticky xl:top-0"><label className="block text-xs text-muted">Sold / Reserved chassis<select className="input-dark mt-1 w-full" value={chassisNumber} onChange={(e) => setChassisNumber(e.target.value)}><option value="">Select unit</option>{options.map((x) => <option key={x.chassisNumber} value={x.chassisNumber}>{x.chassisNumber} · {x.saleStatus}</option>)}</select></label>
      {option && <div className="rounded-lg border border-border bg-background/40 p-3 text-sm"><p className="font-semibold text-white">{option.model.make} {option.model.modelName} {option.model.year}</p><p className="text-xs text-muted">Buyer: {customer?.fullName ?? "No accepted buyer assigned"}</p></div>}
      <label className="block text-xs text-muted">Sale price (LKR)<input type="number" min="1" className="input-dark mt-1 w-full" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} /></label><label className="block text-xs text-muted">Payment method<select className="input-dark mt-1 w-full" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>{["CASH","LEASING","BANK_TRANSFER","CHEQUE"].map((x) => <option key={x}>{x.replace(/_/g," ")}</option>)}</select></label><label className="block text-xs text-muted">Notes<textarea rows={3} className="input-dark mt-1 w-full resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
      {generate.error && <p className="text-xs text-red-300">{generate.error instanceof Error ? generate.error.message : "PDF generation failed."}</p>}
      <div className="space-y-2"><button disabled={!customer || generate.isPending} onClick={async () => window.api.agreements.openPdf(await makePdf())} className="btn-ghost w-full">🖨️ Print Agreement</button><button disabled={!customer || generate.isPending} onClick={makePdf} className="btn-accent w-full">{generate.isPending ? "Generating..." : "📄 Export PDF"}</button><button disabled={!customer} onClick={async () => { if (!customer) return; const path = lastPdf || await makePdf(); window.open(formatWhatsAppUrl(customer.phone, `Your OmniDrive handover agreement ${agreementId} has been prepared: ${path}`), "_blank"); }} className="btn-ghost w-full">💬 Send PDF Link via WhatsApp</button></div>{lastPdf && <p className="break-all text-[10px] text-emerald-300">Saved: {lastPdf}</p>}
    </aside><div className="overflow-auto rounded-xl bg-slate-800 p-5">{option && customer ? <AgreementPreview agreementId={agreementId} customer={customer} vehicle={option} salePrice={Number(salePrice)} paymentMethod={paymentMethod} notes={notes} /> : <div className="p-16 text-center text-muted">Select a chassis with an assigned buyer.</div>}</div></div>
  </div>;
};
export default AgreementPage;
