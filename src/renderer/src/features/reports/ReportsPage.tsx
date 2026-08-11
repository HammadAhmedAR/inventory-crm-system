import React, { useEffect, useMemo, useState } from "react";
import type { ReportFilterPayload, ReportFormat, ReportRow, ReportType, ReportTimeframe } from "../../../../shared/ipc";

const CATEGORIES: Array<{ type: ReportType; label: string }> = [
  { type: "INVENTORY", label: "🚗 Inventory Stock Report" },
  { type: "CRM", label: "👥 CRM Leads & Pipeline Report" },
  { type: "SALES", label: "💰 Sales & Profitability Report" },
  { type: "EXPENSES", label: "💸 Operational Expenses Report" },
];
const TIMEFRAMES: Array<{ value: ReportTimeframe; label: string }> = [
  { value: "TODAY", label: "Today" }, { value: "THIS_WEEK", label: "This Week" },
  { value: "THIS_MONTH", label: "This Month" }, { value: "CUSTOM", label: "Custom Range" },
];
const today = () => new Date().toISOString().slice(0, 10);
const initialFilters: ReportFilterPayload = { reportType: "INVENTORY", timeframe: "THIS_MONTH", startDate: today(), endDate: today() };
const field = "input-dark w-full";

const ReportsPage: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilterPayload>(initialFilters);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<ReportFormat | null>(null);
  const [message, setMessage] = useState("");
  const payloadKey = JSON.stringify(filters);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true); setMessage("");
      try { const result = await window.api.reports.preview(filters); if (active) setRows(result); }
      catch (error) { if (active) { setRows([]); setMessage(error instanceof Error ? error.message : "Unable to load report preview."); } }
      finally { if (active) setLoading(false); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [payloadKey]);

  const headers = useMemo(() => rows.length ? Object.keys(rows[0]) : [], [rows]);
  const update = (key: keyof ReportFilterPayload, value: string) => setFilters((current) => ({ ...current, [key]: value || undefined }));
  const changeType = (reportType: ReportType) => setFilters((current) => ({ reportType, timeframe: current.timeframe, startDate: current.startDate, endDate: current.endDate }));
  const exportReport = async (format: ReportFormat) => {
    setExporting(format); setMessage("");
    try {
      const result = await window.api.reports.exportFile({ ...filters, format });
      if (result.success) setMessage(`${result.recordCount ?? 0} records exported successfully.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Export failed."); }
    finally { setExporting(null); }
  };
  const showVehicle = filters.reportType !== "EXPENSES";
  const showCrm = filters.reportType === "CRM";

  return <section className="h-full overflow-y-auto p-5 lg:p-7">
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">Reporting center</p><h2 className="mt-1 text-2xl font-bold text-white">Custom reports & exports</h2><p className="mt-1 text-sm text-muted">Filter live dealership data, review the first 10 matches, then save it locally.</p></div></div>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Report category">
        {CATEGORIES.map((category) => <button key={category.type} onClick={() => changeType(category.type)} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filters.reportType === category.type ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-muted hover:text-white"}`}>{category.label}</button>)}
      </div>

      <div className="card mt-5 p-5">
        <div className="flex flex-wrap items-center gap-2"><span className="mr-2 text-xs font-semibold uppercase tracking-wider text-subtle">Timeframe</span>{TIMEFRAMES.map((item) => <button key={item.value} onClick={() => update("timeframe", item.value)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filters.timeframe === item.value ? "bg-accent text-slate-950" : "bg-surface-elevated text-muted hover:text-white"}`}>{item.label}</button>)}</div>
        {filters.timeframe === "CUSTOM" && <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs text-muted">Start date<input type="date" value={filters.startDate ?? ""} max={filters.endDate} onChange={(e) => update("startDate", e.target.value)} className={`${field} mt-1.5`} /></label><label className="text-xs text-muted">End date<input type="date" value={filters.endDate ?? ""} min={filters.startDate} onChange={(e) => update("endDate", e.target.value)} className={`${field} mt-1.5`} /></label></div>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {showVehicle && <><label className="text-xs text-muted">Vehicle make<input value={filters.make ?? ""} onChange={(e) => update("make", e.target.value)} placeholder="TVS, Kia, Honda…" className={`${field} mt-1.5`} /></label><label className="text-xs text-muted">Model<input value={filters.model ?? ""} onChange={(e) => update("model", e.target.value)} placeholder="Any model" className={`${field} mt-1.5`} /></label><label className="text-xs text-muted">Body type<select value={filters.bodyType ?? ""} onChange={(e) => update("bodyType", e.target.value)} className={`${field} mt-1.5`}><option value="">All body types</option><option value="SUV">SUV</option><option value="SUBCOMPACT_SUV">Subcompact SUV</option><option value="BIKE">Bike</option><option value="SCOOTER">Scooter</option><option value="SEDAN">Sedan</option><option value="HATCHBACK">Hatchback</option></select></label></>}
          {(filters.reportType === "INVENTORY" || filters.reportType === "SALES") && <label className="text-xs text-muted">Sale status<select value={filters.status ?? ""} onChange={(e) => update("status", e.target.value)} className={`${field} mt-1.5`}><option value="">All statuses</option><option value="AVAILABLE">Available</option><option value="RESERVED">Reserved</option><option value="SOLD">Sold</option></select></label>}
          {showCrm && <><label className="text-xs text-muted">Lead source<select value={filters.leadSource ?? ""} onChange={(e) => update("leadSource", e.target.value)} className={`${field} mt-1.5`}><option value="">All sources</option><option value="WALK_IN">Walk-In</option><option value="WHATSAPP">WhatsApp</option><option value="FACEBOOK">Facebook</option><option value="REFERRAL">Referral</option></select></label><label className="text-xs text-muted">Pipeline stage<select value={filters.pipelineStage ?? ""} onChange={(e) => update("pipelineStage", e.target.value)} className={`${field} mt-1.5`}><option value="">All stages</option><option value="NEW_LEAD">New Lead</option><option value="CONTACTED">Contacted</option><option value="NEGOTIATION">Negotiation</option><option value="CLOSED_WON">Closed Won</option><option value="CLOSED_LOST">Closed Lost</option></select></label></>}
          {filters.reportType === "EXPENSES" && <label className="text-xs text-muted">Expense category<input value={filters.status ?? ""} onChange={(e) => update("status", e.target.value)} placeholder="All categories" className={`${field} mt-1.5`} /></label>}
        </div>
      </div>

      <div className="card mt-5 overflow-hidden"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h3 className="font-semibold text-white">Live preview</h3><p className="text-xs text-muted">{loading ? "Refreshing…" : `${rows.length} matching record${rows.length === 1 ? "" : "s"} shown (maximum 10)`}</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-surface-elevated text-subtle">{headers.length > 0 && <tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 font-semibold uppercase tracking-wider">{header}</th>)}</tr>}</thead><tbody className="divide-y divide-border">{rows.map((row, index) => <tr key={index} className="hover:bg-surface-elevated/50">{headers.map((header) => <td key={header} className="max-w-[240px] truncate whitespace-nowrap px-4 py-3 text-slate-300">{row[header] == null ? "—" : String(row[header])}</td>)}</tr>)}</tbody></table>{!loading && rows.length === 0 && <div className="px-5 py-12 text-center text-sm text-muted">No records match these filters.</div>}</div></div>

      <div className="sticky bottom-0 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface/95 p-4 shadow-xl backdrop-blur"><p className={`text-sm ${message.toLowerCase().includes("success") ? "text-emerald-300" : "text-muted"}`}>{message || "Exports include every matching record, not only the preview."}</p><div className="flex gap-2"><button disabled={Boolean(exporting)} onClick={() => exportReport("CSV")} className="btn-ghost border border-border">{exporting === "CSV" ? "Exporting…" : "📄 Export to CSV"}</button><button disabled={Boolean(exporting)} onClick={() => exportReport("XLSX")} className="btn-accent">{exporting === "XLSX" ? "Exporting…" : "📊 Export to Excel (.xlsx)"}</button></div></div>
    </div>
  </section>;
};

export default ReportsPage;
