import React, { useState } from "react";

interface DocumentChecklistProps {
  open: boolean;
  selectedChassis: { chassisNumber: string; keysCount: number; documentsPresent: boolean } | null;
  onClose: () => void;
  onSave: (payload: { chassisNumber: string; keysCount: number; documentsPresent: boolean }) => Promise<void> | void;
}

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  open,
  selectedChassis,
  onClose,
  onSave,
}) => {
  const [keysCount, setKeysCount] = useState(2);
  const [mtaDocsPresent, setMtaDocsPresent] = useState(false);
  const [importClearanceVerified, setImportClearanceVerified] = useState(false);
  const [spareKitIncluded, setSpareKitIncluded] = useState(false);

  React.useEffect(() => {
    if (selectedChassis) {
      setKeysCount(selectedChassis.keysCount === 1 ? 1 : 2);
      setMtaDocsPresent(Boolean(selectedChassis.documentsPresent));
      setImportClearanceVerified(Boolean(selectedChassis.documentsPresent));
      setSpareKitIncluded(Boolean(selectedChassis.documentsPresent));
    }
  }, [selectedChassis]);

  if (!open || !selectedChassis) return null;

  const allChecked = mtaDocsPresent && importClearanceVerified && spareKitIncluded;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/40">
      <div className="h-full w-full max-w-md border-l border-border bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-subtle">Custody audit</p>
            <h3 className="text-lg font-semibold text-white">{selectedChassis.chassisNumber}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-border bg-surface-elevated text-muted hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-subtle">
              Key count
            </label>
            <div className="flex gap-2">
              {[1, 2].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setKeysCount(count)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                    keysCount === count
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-surface-elevated text-muted"
                  }`}
                >
                  {count} Key{count > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-background/40 p-3">
            {[
              ["MTA / DMT transfer documents present", mtaDocsPresent, setMtaDocsPresent],
              ["Import clearance papers verified", importClearanceVerified, setImportClearanceVerified],
              ["Spare tire / tool kit included", spareKitIncluded, setSpareKitIncluded],
            ].map(([label, checked, setter]) => (
              <label key={label as string} className="flex cursor-pointer items-center gap-3 rounded-lg bg-surface-elevated px-3 py-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={Boolean(checked)}
                  onChange={(e) => (setter as React.Dispatch<React.SetStateAction<boolean>>)(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                <span>{label as string}</span>
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-3 text-sm text-muted">
            <div className="flex items-center justify-between">
              <span>Audit status</span>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${allChecked ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                {allChecked ? "Ready for handover" : "Checks pending"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await onSave({
                chassisNumber: selectedChassis.chassisNumber,
                keysCount,
                documentsPresent: allChecked,
              });
              onClose();
            }}
            className="btn-accent w-full"
          >
            Save Custody Checklist
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentChecklist;
