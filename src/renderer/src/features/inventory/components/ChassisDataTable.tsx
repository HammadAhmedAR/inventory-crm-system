import React from "react";
import type { InventoryUnit } from "../../../hooks/useInventoryQueries";

const SALE_STATUS_CLASSES: Record<string, string> = {
  AVAILABLE: "bg-yellow-500/15 text-yellow-300 border border-yellow-400/30",
  RESERVED: "bg-violet-500/15 text-violet-300 border border-violet-400/30",
  SOLD: "bg-slate-700 text-slate-200 border border-slate-600",
};

const HEALTH_STATUS_CLASSES: Record<string, string> = {
  READY_FOR_SALE: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
  UNDER_REPAIR: "bg-red-500/15 text-red-300 border border-red-400/30",
  NEEDS_REPAIR: "bg-red-500/15 text-red-300 border border-red-400/30",
  PENDING_CHECK: "bg-amber-500/15 text-amber-300 border border-amber-400/30",
};

function formatLkr(value: number | null | undefined) {
  const safe = Number(value ?? 0);
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(safe);
}

interface ChassisDataTableProps {
  units: InventoryUnit[];
  allUnits: InventoryUnit[];
  search: string;
  makeFilter: string;
  modelFilter: string;
  bodyTypeFilter: string;
  saleStatusFilter: string;
  onSearch: (value: string) => void;
  onMakeFilter: (value: string) => void;
  onModelFilter: (value: string) => void;
  onBodyTypeFilter: (value: string) => void;
  onSaleStatusFilter: (value: string) => void;
  selectedStatus: string;
  onStatusFilter: (value: string) => void;
  onRepair: (unit: InventoryUnit) => void;
  onCustody: (unit: InventoryUnit) => void;
  onChangeSaleStatus: (unit: InventoryUnit) => void;
  onDelete: (unit: InventoryUnit) => void;
}

const ChassisDataTable: React.FC<ChassisDataTableProps> = ({
  units,
  allUnits,
  search,
  makeFilter,
  modelFilter,
  bodyTypeFilter,
  saleStatusFilter,
  onSearch,
  onMakeFilter,
  onModelFilter,
  onBodyTypeFilter,
  onSaleStatusFilter,
  selectedStatus,
  onStatusFilter,
  onRepair,
  onCustody,
  onChangeSaleStatus,
  onDelete,
}) => {
  const makes = Array.from(new Set(allUnits.map((unit) => unit.model.make))).sort();
  const models = Array.from(new Map(allUnits.filter((unit) => !makeFilter || unit.model.make === makeFilter).map((unit) => [unit.model.id, unit.model])).values());
  const bodyIcon: Record<string, string> = { SUV: "🚙", SUBCOMPACT_SUV: "🚗", BIKE: "🏍️", SCOOTER: "🛵", SEDAN: "🚘", HATCHBACK: "🚗" };
  const filterButtons = [
    { label: "All Units", value: "ALL" },
    { label: "Ready for Sale", value: "READY_FOR_SALE" },
    { label: "Needs/In Repair", value: "REPAIR" },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-border bg-background/40 px-5 py-3">
        <div className="mb-3 grid gap-2 lg:grid-cols-[minmax(220px,1fr)_160px_190px_180px]">
          <input id="inventory-search" type="search" value={search} onChange={(e) => onSearch(e.target.value)} className="input-dark w-full" placeholder="🔍 Chassis # or engine #" />
          <select value={makeFilter} onChange={(e) => onMakeFilter(e.target.value)} className="input-dark"><option value="">🏷️ All Makes</option>{makes.map((make) => <option key={make}>{make}</option>)}</select>
          <select value={modelFilter} onChange={(e) => onModelFilter(e.target.value)} className="input-dark"><option value="">🚗 All Models</option>{models.map((model) => <option key={model.id} value={model.id}>{model.modelName} {model.year}</option>)}</select>
          <select value={bodyTypeFilter} onChange={(e) => onBodyTypeFilter(e.target.value)} className="input-dark"><option value="">🛵 All Body Types</option>{["SUV","SUBCOMPACT_SUV","BIKE","SCOOTER","SEDAN","HATCHBACK"].map((type) => <option key={type} value={type}>{type.replace(/_/g," ")}</option>)}</select>
        </div>
        <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-sm">Vehicle Inventory</h3>
          <span className="badge-muted">{units.length} units</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filterButtons.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onStatusFilter(filter.value)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                selectedStatus === filter.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface-elevated text-muted hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">{["ALL","AVAILABLE","RESERVED","SOLD"].map((status) => <button key={status} type="button" onClick={() => onSaleStatusFilter(status)} className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${saleStatusFilter === status ? "border-emerald-400 bg-emerald-500/15 text-emerald-300" : "border-border bg-surface-elevated text-muted"}`}>{status === "ALL" ? "All" : status}</button>)}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-background/30 text-left text-subtle">
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Chassis #</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Model & Year</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Color</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Body Type</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Sale Status</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Health</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Base / Floor</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Custody</th>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center text-sm text-subtle">
                  No chassis units match this search or filter.
                </td>
              </tr>
            )}
            {units.map((unit, index) => (
              <tr
                key={unit.chassisNumber}
                className={`${index % 2 === 0 ? "bg-background/10" : "bg-surface/40"} border-t border-border/60`}
              >
                <td className="px-4 py-3 align-top">
                  <div className="font-mono text-xs font-bold text-accent">{unit.chassisNumber}</div>
                </td>

                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-white">{unit.model.make} {unit.model.modelName}</div>
                  <div className="text-[11px] text-subtle">{unit.model.year}</div>
                </td>

                <td className="px-4 py-3 align-top text-muted">{unit.color}</td>

                <td className="px-4 py-3 align-top"><span className="badge-muted whitespace-nowrap">{bodyIcon[unit.model.bodyType] ?? "🚗"} {unit.model.bodyType.replace(/_/g, " ")}</span></td>

                <td className="px-4 py-3 align-top">
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${SALE_STATUS_CLASSES[unit.saleStatus] ?? "bg-slate-700 text-slate-200"}`}>
                    {unit.saleStatus}
                  </span>
                </td>

                <td className="px-4 py-3 align-top">
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${HEALTH_STATUS_CLASSES[unit.healthStatus] ?? "bg-slate-700 text-slate-200"}`}>
                    {unit.healthStatus.replace(/_/g, " ")}
                  </span>
                </td>

                <td className="px-4 py-3 align-top">
                  <div className="text-white font-medium text-[12px]">{formatLkr(unit.baseQuotingPrice)}</div>
                  <div className="text-[11px] text-subtle">{formatLkr(unit.minSellingPrice ?? unit.baseQuotingPrice)}</div>
                </td>

                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span className="rounded-full bg-background px-2 py-1">Keys: {unit.keysCount}</span>
                    <span className={`rounded-full px-2 py-1 ${unit.documentsPresent ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700 text-slate-300"}`}>
                      Docs {unit.documentsPresent ? "OK" : "Missing"}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => onRepair(unit)}
                      className="rounded-md border border-border bg-surface-elevated px-2 py-1 text-[10px] font-medium text-muted hover:text-white"
                    >
                      Manage Health & Repairs
                    </button>
                    <button
                      type="button"
                      onClick={() => onCustody(unit)}
                      className="rounded-md border border-border bg-surface-elevated px-2 py-1 text-[10px] font-medium text-muted hover:text-white"
                    >
                      Custody Checklist
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeSaleStatus(unit)}
                      className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-[10px] font-medium text-accent hover:bg-accent/20"
                    >
                      Change Sale Status
                    </button>
                    <button type="button" onClick={() => onDelete(unit)} className="rounded-md border border-red-500/30 px-2 py-1 text-[10px] font-medium text-red-300 hover:bg-red-500/10">🗑️ Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChassisDataTable;
