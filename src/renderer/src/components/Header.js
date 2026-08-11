import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef } from "react";
const ROUTE_LABELS = {
    "/workbench": "Workbench",
    "/inventory": "Inventory & Repairs",
    "/prospects": "Prospects & Quotes",
    "/agreements": "Handover Agreement",
};
const Header = ({ activeRoute, onWalkInLogger }) => {
    const searchRef = useRef(null);
    // Focus search on Ctrl+K / Cmd+K
    const handleSearchFocus = useCallback((e) => {
        const isMac = navigator.platform.toLowerCase().includes("mac");
        const modKey = isMac ? e.metaKey : e.ctrlKey;
        if (modKey && e.key === "k") {
            e.preventDefault();
            searchRef.current?.focus();
            searchRef.current?.select();
        }
    }, []);
    useEffect(() => {
        window.addEventListener("keydown", handleSearchFocus);
        return () => window.removeEventListener("keydown", handleSearchFocus);
    }, [handleSearchFocus]);
    return (_jsxs("header", { className: "\n        flex items-center justify-between gap-4 px-5 h-[60px] min-h-[60px]\n        bg-surface border-b border-border flex-shrink-0\n      ", role: "banner", children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("h1", { className: "text-white font-bold text-base tracking-tight whitespace-nowrap", children: "OmniDrive \u2014 Dealership Operations" }), _jsx("span", { className: "text-border text-lg font-light hidden md:block", "aria-hidden": true, children: "\u2014" }), _jsx("span", { className: "text-muted text-sm font-medium truncate hidden md:block", children: ROUTE_LABELS[activeRoute] })] }), _jsx("div", { className: "flex-1 max-w-md", children: _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-sm", "aria-hidden": true, children: "\uD83D\uDD0D" }), _jsx("input", { ref: searchRef, id: "global-search-input", type: "text", placeholder: "Search Chassis / Customer (Ctrl+K)...", className: "\n              w-full bg-background border border-border rounded-lg\n              pl-9 pr-3 py-1.5 text-sm text-white placeholder-subtle\n              outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20\n              transition-all duration-150\n            ", "aria-label": "Global search" }), _jsx("kbd", { className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-subtle bg-surface border border-border rounded px-1 py-0.5 pointer-events-none", children: "\u2303K" })] }) }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsxs("button", { id: "header-notifications-btn", className: "relative w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-surface-elevated transition-all duration-150", "aria-label": "Notifications", children: ["\uD83D\uDD14", _jsx("span", { className: "absolute top-1 right-1 w-2 h-2 bg-accent rounded-full ring-2 ring-surface" })] }), _jsxs("button", { id: "walk-in-logger-btn", onClick: onWalkInLogger, className: "\n            flex items-center gap-1.5 bg-accent hover:bg-accent-hover\n            text-slate-900 font-semibold text-sm px-3.5 py-1.5 rounded-lg\n            transition-all duration-150 active:scale-95\n            focus:outline-none focus:ring-2 focus:ring-accent/50\n          ", "aria-label": "Open Walk-In Logger (Ctrl+N)", children: [_jsx("span", { "aria-hidden": true, children: "+" }), _jsx("span", { children: "Walk-In Logger" }), _jsx("kbd", { className: "text-[10px] bg-accent-hover/60 px-1.5 py-0.5 rounded font-mono opacity-80", children: "Ctrl+N" })] })] })] }));
};
export default Header;
