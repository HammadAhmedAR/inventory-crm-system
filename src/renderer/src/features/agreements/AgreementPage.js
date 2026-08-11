import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const STATUS_BADGE = {
    Draft: "badge-muted",
    "Pending Signature": "badge-accent",
    Signed: "badge-success",
    Voided: "badge-muted",
};
const AGREEMENTS = [
    {
        id: "AGR-001",
        customer: "David Nguyen",
        vehicle: "2023 Honda CR-V Hybrid",
        date: "2026-07-28",
        status: "Signed",
    },
    {
        id: "AGR-002",
        customer: "James Harrington",
        vehicle: "2024 Ford Ranger XLT",
        date: "2026-08-01",
        status: "Pending Signature",
    },
    {
        id: "AGR-003",
        customer: "Priya Sharma",
        vehicle: "2023 Mazda CX-5",
        date: "2026-08-02",
        status: "Draft",
    },
    {
        id: "AGR-004",
        customer: "Emma Watson",
        vehicle: "2022 Subaru Outback",
        date: "2026-07-15",
        status: "Voided",
    },
];
const AgreementPage = () => {
    return (_jsxs("div", { className: "h-full overflow-y-auto p-6 animate-fade-in", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCC4" }), _jsx("h2", { className: "text-2xl font-bold text-white tracking-tight", children: "Handover Agreements" })] }), _jsx("button", { className: "btn-accent", id: "agreements-new-btn", children: "+ New Agreement" })] }), _jsx("p", { className: "text-muted text-sm", children: "Generate, manage, and track vehicle handover agreements and customer sign-offs." })] }), _jsx("div", { className: "grid grid-cols-4 gap-3 mb-6", children: [
                    { label: "Total Agreements", value: "248", style: "text-white" },
                    { label: "Signed This Month", value: "34", style: "text-success" },
                    { label: "Pending Signature", value: "6", style: "text-accent" },
                    { label: "Drafts", value: "11", style: "text-muted" },
                ].map(({ label, value, style }) => (_jsxs("div", { className: "card px-4 py-4", children: [_jsx("p", { className: `text-2xl font-bold ${style}`, children: value }), _jsx("p", { className: "text-subtle text-xs mt-1", children: label })] }, label))) }), _jsxs("div", { className: "card overflow-hidden", children: [_jsxs("div", { className: "px-5 py-3 border-b border-border flex items-center justify-between", children: [_jsx("h3", { className: "text-white font-semibold text-sm", children: "Recent Agreements" }), _jsx("button", { className: "btn-ghost text-xs", id: "agreements-view-all-btn", children: "View all \u2192" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-border bg-background/40", children: [
                                            "Agreement ID",
                                            "Customer",
                                            "Vehicle",
                                            "Date",
                                            "Status",
                                            "Actions",
                                        ].map((col) => (_jsx("th", { className: "text-left text-subtle text-xs font-semibold uppercase tracking-wider px-5 py-3", children: col }, col))) }) }), _jsx("tbody", { children: AGREEMENTS.map((a, i) => (_jsxs("tr", { className: `border-b border-border/50 hover:bg-surface-elevated transition-colors duration-100 ${i % 2 === 0 ? "" : "bg-background/20"}`, children: [_jsx("td", { className: "px-5 py-3 font-mono text-accent text-xs", children: a.id }), _jsx("td", { className: "px-5 py-3 text-white font-medium", children: a.customer }), _jsx("td", { className: "px-5 py-3 text-muted", children: a.vehicle }), _jsx("td", { className: "px-5 py-3 text-muted", children: a.date }), _jsx("td", { className: "px-5 py-3", children: _jsx("span", { className: STATUS_BADGE[a.status], children: a.status }) }), _jsx("td", { className: "px-5 py-3", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "btn-ghost py-1 px-2 text-xs", id: `agreements-view-${a.id}`, children: "View" }), a.status === "Draft" && (_jsx("button", { className: "btn-ghost py-1 px-2 text-xs text-accent hover:text-accent", id: `agreements-send-${a.id}`, children: "Send" }))] }) })] }, a.id))) })] }) })] }), _jsxs("div", { className: "mt-4 card p-4 flex items-center gap-3 border-accent/20 bg-accent-muted/20", children: [_jsx("span", { className: "text-accent text-lg flex-shrink-0", children: "\u2139\uFE0F" }), _jsx("p", { className: "text-muted text-sm", children: "Full PDF generation, e-signature integration, and template builder coming in Phase 2." })] })] }));
};
export default AgreementPage;
