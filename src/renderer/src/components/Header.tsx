import React, { useCallback, useEffect, useRef } from "react";
import { Route } from "./Sidebar";

const ROUTE_LABELS: Record<Route, string> = {
  "/workbench": "Workbench",
  "/inventory": "Inventory & Repairs",
  "/prospects": "Prospects & Quotes",
  "/agreements": "Handover Agreement",
};

interface HeaderProps {
  activeRoute: Route;
  onWalkInLogger: () => void;
  onFinancials: () => void;
  onLock: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeRoute, onWalkInLogger, onFinancials, onLock }) => {
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search on Ctrl+K / Cmd+K
  const handleSearchFocus = useCallback((e: KeyboardEvent) => {
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

  return (
    <header
      className="
        flex items-center justify-between gap-4 px-5 h-[60px] min-h-[60px]
        bg-surface border-b border-border flex-shrink-0 [-webkit-app-region:drag]
      "
      role="banner"
    >
      {/* Left: Title / Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-white font-bold text-base tracking-tight whitespace-nowrap">
          OmniDrive — Dealership Operations
        </h1>
        <span
          className="text-border text-lg font-light hidden md:block"
          aria-hidden
        >
          —
        </span>
        <span className="text-muted text-sm font-medium truncate hidden md:block">
          {ROUTE_LABELS[activeRoute]}
        </span>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-md [-webkit-app-region:no-drag]">
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-sm"
            aria-hidden
          >
            🔍
          </span>
          <input
            ref={searchRef}
            id="global-search-input"
            type="text"
            placeholder="Search Chassis / Customer (Ctrl+K)..."
            className="
              w-full bg-background border border-border rounded-lg
              pl-9 pr-3 py-1.5 text-sm text-white placeholder-subtle
              outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
              transition-all duration-150
            "
            aria-label="Global search"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-subtle bg-surface border border-border rounded px-1 py-0.5 pointer-events-none">
            ⌃K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 [-webkit-app-region:no-drag]">
        <button onClick={onFinancials} className="btn-ghost px-3 py-1.5 text-xs" aria-label="Open expense and sale recorder">Financials</button>
        <button onClick={onLock} className="btn-ghost h-8 w-8 p-0" aria-label="Lock OmniDrive">🔒</button>
        {/* Notification dot */}
        <button
          id="header-notifications-btn"
          className="relative w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-white hover:bg-surface-elevated transition-all duration-150"
          aria-label="Notifications"
        >
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full ring-2 ring-surface" />
        </button>

        <div className="ml-1 flex items-center overflow-hidden rounded-lg border border-border" aria-label="Window controls">
          <button onClick={() => window.api.windowControls.minimize()} className="flex h-8 w-9 items-center justify-center bg-background/40 text-sm text-muted hover:bg-surface-elevated hover:text-white" aria-label="Minimize window" title="Minimize">&#8722;</button>
          <button onClick={() => window.api.windowControls.toggleMaximize()} className="flex h-8 w-9 items-center justify-center border-l border-border bg-background/40 text-xs text-muted hover:bg-surface-elevated hover:text-white" aria-label="Maximize or restore window" title="Maximize / Restore">&#9633;</button>
          <button onClick={() => window.api.windowControls.close()} className="flex h-8 w-9 items-center justify-center border-l border-border bg-background/40 text-base text-muted hover:bg-red-600 hover:text-white" aria-label="Close window" title="Close">&#215;</button>
        </div>

        {/* Walk-In Logger CTA */}
        <button
          id="walk-in-logger-btn"
          onClick={onWalkInLogger}
          className="
            flex items-center gap-1.5 bg-accent hover:bg-accent-hover
            text-slate-900 font-semibold text-sm px-3.5 py-1.5 rounded-lg
            transition-all duration-150 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-accent/50
          "
          aria-label="Open Walk-In Logger (Ctrl+N)"
        >
          <span aria-hidden>+</span>
          <span>Walk-In Logger</span>
          <kbd className="text-[10px] bg-accent-hover/60 px-1.5 py-0.5 rounded font-mono opacity-80">
            Ctrl+N
          </kbd>
        </button>
      </div>
    </header>
  );
};

export default Header;
