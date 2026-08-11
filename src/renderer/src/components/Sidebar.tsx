import React from "react";
import { useRecycleBin } from "../hooks/useRecycleBin";

export type Route = "/workbench" | "/inventory" | "/prospects" | "/agreements" | "/reports" | "/settings" | "/todos" | "/recycle-bin";

interface NavItem {
  route: Route;
  icon: string;
  label: string;
  sublabel: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    route: "/workbench",
    icon: "📊",
    label: "Workbench",
    sublabel: "Overview & KPIs",
  },
  {
    route: "/inventory",
    icon: "🚗",
    label: "Inventory & Repairs",
    sublabel: "Stock & Workshop",
  },
  {
    route: "/prospects",
    icon: "👥",
    label: "Prospects & Quotes",
    sublabel: "Sales Pipeline",
  },
  {
    route: "/agreements",
    icon: "📄",
    label: "Handover Agreement",
    sublabel: "Docs & Contracts",
  },
  {
    route: "/reports",
    icon: "📈",
    label: "Reports & Analytics",
    sublabel: "Filtered exports",
  },
  {
    route: "/todos",
    icon: "✅",
    label: "Tasks & Reminders",
    sublabel: "Follow-ups & repairs",
  },
  {
    route: "/settings",
    icon: "⚙️",
    label: "Dealership Settings",
    sublabel: "Company & security",
  },
  {
    route: "/recycle-bin",
    icon: "🗑️",
    label: "Recycle Bin",
    sublabel: "Restore deleted items",
  },
];

interface SidebarProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  onNavigate,
  collapsed,
  onToggleCollapse,
}) => {
  const { data: deletedItems = [] } = useRecycleBin();
  return (
    <aside
      className={`
        flex flex-col h-full bg-surface border-r border-border
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? "w-16" : "w-60"}
      `}
      aria-label="Main navigation sidebar"
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-3 py-4 border-b border-border min-h-[60px]">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-slate-900 font-black text-sm shadow-glow"
          aria-label="OmniDrive logo"
        >
          OD
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight tracking-tight">
              OmniDrive
            </p>
            <p className="text-subtle text-xs">Dealership OS</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav
        className="flex-1 overflow-y-auto px-2 py-3 space-y-1"
        role="navigation"
      >
        {!collapsed && (
          <p className="text-subtle text-[10px] uppercase tracking-widest font-semibold px-2 pb-1.5 animate-fade-in">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <button
              key={item.route}
              id={`nav-${item.route.replace("/", "")}`}
              onClick={() => onNavigate(item.route)}
              className={`
                w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 cursor-pointer text-left
                ${
                  isActive
                    ? "bg-surface-elevated text-white border-l-2 border-accent pl-[9px]"
                    : "text-muted hover:bg-surface-elevated hover:text-white border-l-2 border-transparent"
                }
              `}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <span
                className="flex-shrink-0 text-base leading-none"
                role="img"
                aria-hidden
              >
                {item.icon}
              </span>
              {!collapsed && (
                <div className="animate-fade-in overflow-hidden">
                  <p className="leading-tight">{item.label}</p>
                  {item.route === "/recycle-bin" && deletedItems.length > 0 && <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{deletedItems.length}</span>}
                  <p className="text-[10px] text-subtle leading-tight">
                    {item.sublabel}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 py-3 border-t border-border">
        <button
          id="sidebar-collapse-toggle"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-subtle hover:text-white hover:bg-surface-elevated transition-all duration-150 text-xs font-medium"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span
            className={`transition-transform duration-300 text-base ${collapsed ? "rotate-180" : ""}`}
            aria-hidden
          >
            ◀
          </span>
          {!collapsed && <span className="animate-fade-in">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
