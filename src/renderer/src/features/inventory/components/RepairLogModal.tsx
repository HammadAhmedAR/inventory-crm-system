import React, { useMemo, useState } from "react";
import type { InventoryUnit } from "../../../hooks/useInventoryQueries";

const ISSUE_OPTIONS = [
  "MECHANICAL",
  "ELECTRICAL",
  "BODYWORK",
  "DETAILING",
] as const;

interface RepairLogModalProps {
  open: boolean;
  selectedUnit: InventoryUnit | null;
  onClose: () => void;
  onSave: (payload: {
    chassisNumber: string;
    issueCategory: string;
    description: string;
    costIncurred: number;
  }) => Promise<void> | void;
  onResolveAll: (chassisNumber: string) => Promise<void> | void;
}

function formatLkr(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const RepairLogModal: React.FC<RepairLogModalProps> = ({
  open,
  selectedUnit,
  onClose,
  onSave,
  onResolveAll,
}) => {
  const [category, setCategory] = useState<(typeof ISSUE_OPTIONS)[number]>("MECHANICAL");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("0");

  const totalRepairCost = useMemo(
    () => (selectedUnit?.repairs ?? []).reduce((sum, repair) => sum + Number(repair.costIncurred || 0), 0),
    [selectedUnit],
  );

  if (!open || !selectedUnit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-subtle">Repair Ledger</p>
            <h3 className="text-lg font-semibold text-white">{selectedUnit.model.make} {selectedUnit.model.modelName}</h3>
          </div>
          <button
            type="button"
            className="h-8 w-8 rounded-lg border border-border bg-surface-elevated text-muted hover:text-white"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-subtle">Chassis</div>
                  <div className="font-mono text-sm font-bold text-accent">{selectedUnit.chassisNumber}</div>
                </div>
                <span className="rounded-full border border-border bg-surface-elevated px-2 py-1 text-[10px] font-semibold text-muted">
                  {selectedUnit.healthStatus.replace(/_/g, " ")}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-muted">
                <span>Total incurred repair cost</span>
                <span className="text-lg font-semibold text-white">{formatLkr(totalRepairCost)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Repair history</h4>
                <button
                  type="button"
                  onClick={() => onResolveAll(selectedUnit.chassisNumber)}
                  className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/20"
                >
                  Mark All Resolved & Set READY_FOR_SALE
                </button>
              </div>

              <div className="space-y-2">
                {(selectedUnit.repairs ?? []).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-background/40 p-4 text-sm text-subtle">
                    No logged issues yet.
                  </div>
                ) : (
                  (selectedUnit.repairs ?? []).map((repair) => (
                    <div key={repair.id} className="rounded-xl border border-border bg-background/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-surface-elevated px-2 py-1 text-[10px] font-semibold text-muted">
                          {repair.issueCategory}
                        </span>
                        <span className="text-[11px] text-subtle">{new Date(repair.loggedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-2 text-sm text-white">{repair.description}</p>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                        <span>{repair.repairStatus}</span>
                        <span className="font-medium text-white">{formatLkr(repair.costIncurred)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-4">
            <h4 className="text-sm font-semibold text-white">Add a repair log</h4>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.15em] text-subtle">
                  Issue category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as (typeof ISSUE_OPTIONS)[number])}
                  className="input-dark w-full"
                >
                  {ISSUE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.15em] text-subtle">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-dark w-full resize-none"
                  placeholder="Describe the issue and next action"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.15em] text-subtle">
                  Estimated / incurred cost (LKR)
                </label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="input-dark w-full"
                  min="0"
                />
              </div>

              <button
                type="button"
                onClick={async () => {
                  await onSave({
                    chassisNumber: selectedUnit.chassisNumber,
                    issueCategory: category,
                    description,
                    costIncurred: Number(cost || 0),
                  });
                  setDescription("");
                  setCost("0");
                }}
                className="btn-accent w-full"
              >
                Save Repair Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairLogModal;
