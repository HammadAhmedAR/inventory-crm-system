import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import WalkInLoggerModal from "./features/workbench/components/WalkInLoggerModal";
// Lazy-load feature pages for performance
const WorkbenchPage = lazy(() => import("./features/workbench/WorkbenchPage"));
const InventoryPage = lazy(() => import("./features/inventory/InventoryPage"));
const ProspectsPage = lazy(() => import("./features/prospects/ProspectsPage"));
const AgreementPage = lazy(() => import("./features/agreements/AgreementPage"));
/** Renders the active route's page component */
const RouteView = ({ route }) => {
    switch (route) {
        case "/workbench":
            return _jsx(WorkbenchPage, {});
        case "/inventory":
            return _jsx(InventoryPage, {});
        case "/prospects":
            return _jsx(ProspectsPage, {});
        case "/agreements":
            return _jsx(AgreementPage, {});
        default:
            return _jsx(WorkbenchPage, {});
    }
};
/** Loading fallback for Suspense */
const ScreenLoader = () => (_jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" }), _jsx("p", { className: "text-muted text-sm", children: "Loading\u2026" })] }) }));
const App = () => {
    const [activeRoute, setActiveRoute] = useState("/workbench");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [walkInOpen, setWalkInOpen] = useState(false);
    /** Open Walk-In Logger */
    const openWalkIn = useCallback(() => setWalkInOpen(true), []);
    const closeWalkIn = useCallback(() => setWalkInOpen(false), []);
    /** Global keyboard shortcuts */
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isMac = navigator.platform.toLowerCase().includes("mac");
            const modKey = isMac ? e.metaKey : e.ctrlKey;
            // Ctrl+N / Cmd+N — Walk-In Logger
            if (modKey && e.key === "n") {
                e.preventDefault();
                setWalkInOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    return (_jsxs("div", { className: "flex h-screen w-screen overflow-hidden bg-background text-white", id: "app-root", children: [_jsx(Sidebar, { activeRoute: activeRoute, onNavigate: setActiveRoute, collapsed: sidebarCollapsed, onToggleCollapse: () => setSidebarCollapsed((prev) => !prev) }), _jsxs("div", { className: "flex flex-col flex-1 min-w-0 overflow-hidden", children: [_jsx(Header, { activeRoute: activeRoute, onWalkInLogger: openWalkIn }), _jsx("main", { className: "flex-1 overflow-hidden bg-background", role: "main", id: "main-content", "aria-label": `${activeRoute.replace("/", "")} screen`, children: _jsx(Suspense, { fallback: _jsx(ScreenLoader, {}), children: _jsx(RouteView, { route: activeRoute }) }) })] }), _jsx(WalkInLoggerModal, { open: walkInOpen, onClose: closeWalkIn })] }));
};
export default App;
