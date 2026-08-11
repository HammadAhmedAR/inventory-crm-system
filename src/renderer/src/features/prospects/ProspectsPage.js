import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const STAGE_BADGE = {
    "New Lead": "badge-muted",
    Contacted: "badge-muted",
    "Quote Sent": "badge-accent",
    Negotiating: "badge-accent",
    Closed: "badge-success",
};
const PROSPECTS = [
    {
        name: "James Harrington",
        vehicle: "2024 Ford Ranger XLT",
        stage: "Negotiating",
        value: "$61,200",
        date: "Today",
    },
    {
        name: "Priya Sharma",
        vehicle: "2023 Mazda CX-5",
        stage: "Quote Sent",
        value: "$44,990",
        date: "Yesterday",
    },
    {
        name: "Michael Torres",
        vehicle: "2022 Toyota Camry",
        stage: "Contacted",
        value: "$32,000",
        date: "2d ago",
    },
    {
        name: "Sarah Kim",
        vehicle: "2024 Hyundai Kona EV",
        stage: "New Lead",
        value: "$52,500",
        date: "3d ago",
    },
    {
        name: "David Nguyen",
        vehicle: "2023 Honda CR-V Hybrid",
        stage: "Closed",
        value: "$49,800",
        date: "5d ago",
    },
];
const ProspectsPage = () => {
    return (_jsxs("div", { className: "h-full overflow-y-auto p-6 animate-fade-in", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDC65" }), _jsx("h2", { className: "text-2xl font-bold text-white tracking-tight", children: "Prospects & Quotes" })] }), _jsx("button", { className: "btn-accent", id: "prospects-add-btn", children: "+ New Prospect" })] }), _jsx("p", { className: "text-muted text-sm", children: "Track your sales pipeline from first contact through to signed deal." })] }), _jsx("div", { className: "grid grid-cols-5 gap-3 mb-6", children: ["New Lead", "Contacted", "Quote Sent", "Negotiating", "Closed"].map((stage, i) => (_jsxs("div", { className: "card px-3 py-3 text-center", children: [_jsx("p", { className: "text-white font-bold text-xl", children: [4, 8, 7, 3, 16][i] }), _jsx("p", { className: "text-subtle text-[11px] mt-0.5 leading-tight", children: stage })] }, stage))) }), _jsxs("div", { className: "card overflow-hidden", children: [_jsxs("div", { className: "px-5 py-3 border-b border-border flex items-center justify-between", children: [_jsx("h3", { className: "text-white font-semibold text-sm", children: "Active Leads" }), _jsx("span", { className: "badge-muted", children: "38 prospects" })] }), _jsx("div", { className: "divide-y divide-border/50", children: PROSPECTS.map((p) => (_jsxs("div", { className: "flex items-center justify-between px-5 py-4 hover:bg-surface-elevated transition-colors duration-100 cursor-pointer group", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-9 h-9 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-sm font-semibold text-muted group-hover:border-accent/40 transition-colors", children: p.name.charAt(0) }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-medium text-sm", children: p.name }), _jsx("p", { className: "text-subtle text-xs", children: p.vehicle })] })] }), _jsxs("div", { className: "flex items-center gap-4 text-right", children: [_jsx("span", { className: STAGE_BADGE[p.stage], children: p.stage }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-semibold text-sm", children: p.value }), _jsx("p", { className: "text-subtle text-xs", children: p.date })] })] })] }, p.name))) })] })] }));
};
export default ProspectsPage;
