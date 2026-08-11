import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
const ISSUE_OPTIONS = [
    "MECHANICAL",
    "ELECTRICAL",
    "BODYWORK",
    "DETAILING",
];
function formatLkr(value) {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        maximumFractionDigits: 0,
    }).format(value || 0);
}
const RepairLogModal = ({ open, selectedUnit, onClose, onSave, onResolveAll, }) => {
    const [category, setCategory] = useState("MECHANICAL");
    const [description, setDescription] = useState("");
    const [cost, setCost] = useState("0");
    const totalRepairCost = useMemo(() => (selectedUnit?.repairs ?? []).reduce((sum, repair) => sum + Number(repair.costIncurred || 0), 0), [selectedUnit]);
    if (!open || !selectedUnit)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4", children: _jsxs("div", { className: "w-full max-w-3xl rounded-2xl border border-border bg-surface shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.2em] text-subtle", children: "Repair Ledger" }), _jsxs("h3", { className: "text-lg font-semibold text-white", children: [selectedUnit.model.make, " ", selectedUnit.model.modelName] })] }), _jsx("button", { type: "button", className: "h-8 w-8 rounded-lg border border-border bg-surface-elevated text-muted hover:text-white", onClick: onClose, children: "\u00D7" })] }), _jsxs("div", { className: "grid gap-5 p-6 md:grid-cols-[1.2fr_0.8fr]", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-subtle", children: "Chassis" }), _jsx("div", { className: "font-mono text-sm font-bold text-accent", children: selectedUnit.chassisNumber })] }), _jsx("span", { className: "rounded-full border border-border bg-surface-elevated px-2 py-1 text-[10px] font-semibold text-muted", children: selectedUnit.healthStatus.replace(/_/g, " ") })] }), _jsxs("div", { className: "mt-3 flex items-center justify-between text-sm text-muted", children: [_jsx("span", { children: "Total incurred repair cost" }), _jsx("span", { className: "text-lg font-semibold text-white", children: formatLkr(totalRepairCost) })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-sm font-semibold text-white", children: "Repair history" }), _jsx("button", { type: "button", onClick: () => onResolveAll(selectedUnit.chassisNumber), className: "rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/20", children: "Mark All Resolved & Set READY_FOR_SALE" })] }), _jsx("div", { className: "space-y-2", children: (selectedUnit.repairs ?? []).length === 0 ? (_jsx("div", { className: "rounded-xl border border-dashed border-border bg-background/40 p-4 text-sm text-subtle", children: "No logged issues yet." })) : ((selectedUnit.repairs ?? []).map((repair) => (_jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("span", { className: "rounded-full bg-surface-elevated px-2 py-1 text-[10px] font-semibold text-muted", children: repair.issueCategory }), _jsx("span", { className: "text-[11px] text-subtle", children: new Date(repair.loggedAt).toLocaleDateString() })] }), _jsx("p", { className: "mt-2 text-sm text-white", children: repair.description }), _jsxs("div", { className: "mt-3 flex items-center justify-between text-[11px] text-muted", children: [_jsx("span", { children: repair.repairStatus }), _jsx("span", { className: "font-medium text-white", children: formatLkr(repair.costIncurred) })] })] }, repair.id)))) })] })] }), _jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [_jsx("h4", { className: "text-sm font-semibold text-white", children: "Add a repair log" }), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-[11px] font-semibold uppercase tracking-[0.15em] text-subtle", children: "Issue category" }), _jsx("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "input-dark w-full", children: ISSUE_OPTIONS.map((option) => (_jsx("option", { value: option, children: option }, option))) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-[11px] font-semibold uppercase tracking-[0.15em] text-subtle", children: "Description" }), _jsx("textarea", { rows: 4, value: description, onChange: (e) => setDescription(e.target.value), className: "input-dark w-full resize-none", placeholder: "Describe the issue and next action" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-[11px] font-semibold uppercase tracking-[0.15em] text-subtle", children: "Estimated / incurred cost (LKR)" }), _jsx("input", { type: "number", value: cost, onChange: (e) => setCost(e.target.value), className: "input-dark w-full", min: "0" })] }), _jsx("button", { type: "button", onClick: async () => {
                                                await onSave({
                                                    chassisNumber: selectedUnit.chassisNumber,
                                                    issueCategory: category,
                                                    description,
                                                    costIncurred: Number(cost || 0),
                                                });
                                                setDescription("");
                                                setCost("0");
                                            }, className: "btn-accent w-full", children: "Save Repair Entry" })] })] })] })] }) }));
};
export default RepairLogModal;
