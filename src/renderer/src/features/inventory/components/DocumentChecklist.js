import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
const DocumentChecklist = ({ open, selectedChassis, onClose, onSave, }) => {
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
    if (!open || !selectedChassis)
        return null;
    const allChecked = mtaDocsPresent && importClearanceVerified && spareKitIncluded;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-end justify-end bg-slate-950/40", children: _jsxs("div", { className: "h-full w-full max-w-md border-l border-border bg-surface p-5 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.18em] text-subtle", children: "Custody audit" }), _jsx("h3", { className: "text-lg font-semibold text-white", children: selectedChassis.chassisNumber })] }), _jsx("button", { type: "button", onClick: onClose, className: "h-8 w-8 rounded-lg border border-border bg-surface-elevated text-muted hover:text-white", children: "\u00D7" })] }), _jsxs("div", { className: "mt-6 space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-[11px] font-semibold uppercase tracking-[0.15em] text-subtle", children: "Key count" }), _jsx("div", { className: "flex gap-2", children: [1, 2].map((count) => (_jsxs("button", { type: "button", onClick: () => setKeysCount(count), className: `flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${keysCount === count
                                            ? "border-accent bg-accent/10 text-accent"
                                            : "border-border bg-surface-elevated text-muted"}`, children: [count, " Key", count > 1 ? "s" : ""] }, count))) })] }), _jsx("div", { className: "space-y-3 rounded-xl border border-border bg-background/40 p-3", children: [
                                ["MTA / DMT transfer documents present", mtaDocsPresent, setMtaDocsPresent],
                                ["Import clearance papers verified", importClearanceVerified, setImportClearanceVerified],
                                ["Spare tire / tool kit included", spareKitIncluded, setSpareKitIncluded],
                            ].map(([label, checked, setter]) => (_jsxs("label", { className: "flex cursor-pointer items-center gap-3 rounded-lg bg-surface-elevated px-3 py-2 text-sm text-white", children: [_jsx("input", { type: "checkbox", checked: Boolean(checked), onChange: (e) => setter(e.target.checked), className: "h-4 w-4 accent-accent" }), _jsx("span", { children: label })] }, label))) }), _jsx("div", { className: "rounded-xl border border-border bg-background/40 p-3 text-sm text-muted", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Audit status" }), _jsx("span", { className: `rounded-full px-2 py-1 text-[10px] font-semibold ${allChecked ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`, children: allChecked ? "Ready for handover" : "Checks pending" })] }) }), _jsx("button", { type: "button", onClick: async () => {
                                await onSave({
                                    chassisNumber: selectedChassis.chassisNumber,
                                    keysCount,
                                    documentsPresent: allChecked,
                                });
                                onClose();
                            }, className: "btn-accent w-full", children: "Save Custody Checklist" })] })] }) }));
};
export default DocumentChecklist;
