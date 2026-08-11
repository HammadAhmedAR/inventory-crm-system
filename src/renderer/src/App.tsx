import React, { useState, useCallback, useEffect, lazy, Suspense } from "react";
import Sidebar, { Route } from "./components/Sidebar";
import Header from "./components/Header";
import WalkInLoggerModal from "./features/workbench/components/WalkInLoggerModal";
import ExpenseAndSaleModal from "./features/financials/components/ExpenseAndSaleModal";
import LoginView from "./features/auth/LoginView";
import { useAuthStore } from "./store/useAuthStore";
import ToastHost from "./components/shared/ToastHost";

// Lazy-load feature pages for performance
const WorkbenchPage = lazy(() => import("./features/workbench/WorkbenchPage"));
const InventoryPage = lazy(() => import("./features/inventory/InventoryPage"));
const ProspectsPage = lazy(() => import("./features/prospects/ProspectsPage"));
const AgreementPage = lazy(() => import("./features/agreements/AgreementPage"));
const ReportsPage = lazy(() => import("./features/reports/ReportsPage"));
const ProfileSettingsPage = lazy(() => import("./features/settings/ProfileSettingsPage"));
const TasksPage = lazy(() => import("./features/todos/TasksPage"));
const RecycleBinPage = lazy(() => import("./features/recyclebin/RecycleBinPage"));

/** Renders the active route's page component */
const RouteView: React.FC<{ route: Route; onNavigate: (route: Route) => void }> = ({ route, onNavigate }) => {
  switch (route) {
    case "/workbench":
      return <WorkbenchPage />;
    case "/inventory":
      return <InventoryPage />;
    case "/prospects":
      return <ProspectsPage />;
    case "/agreements":
      return <AgreementPage />;
    case "/reports":
      return <ReportsPage />;
    case "/settings":
      return <ProfileSettingsPage />;
    case "/todos":
      return <TasksPage onNavigate={onNavigate} />;
    case "/recycle-bin":
      return <RecycleBinPage />;
    default:
      return <WorkbenchPage />;
  }
};

/** Loading fallback for Suspense */
const ScreenLoader: React.FC = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      <p className="text-muted text-sm">Loading…</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<Route>("/workbench");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [walkInOpen, setWalkInOpen] = useState<boolean>(false);
  const [financialsOpen, setFinancialsOpen] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  /** Open Walk-In Logger */
  const openWalkIn = useCallback(() => setWalkInOpen(true), []);
  const closeWalkIn = useCallback(() => setWalkInOpen(false), []);

  /** Global keyboard shortcuts */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  if (!isLoggedIn || !user) return <LoginView />;

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-background text-white"
      id="app-root"
    >
      {/* ─── Left Sidebar ─────────────────────────────────── */}
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={setActiveRoute}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* ─── Right Panel ──────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header activeRoute={activeRoute} onWalkInLogger={openWalkIn} onFinancials={() => setFinancialsOpen(true)} userName={user.fullName} onLogout={() => { logout(); setActiveRoute("/workbench"); }} />

        {/* Main Content */}
        <main
          className="flex-1 overflow-hidden bg-background"
          role="main"
          id="main-content"
          aria-label={`${activeRoute.replace("/", "")} screen`}
        >
          <Suspense fallback={<ScreenLoader />}>
            <RouteView route={activeRoute} onNavigate={setActiveRoute} />
          </Suspense>
        </main>
      </div>

      {/* ─── Walk-In Logger Modal ─────────────────────────── */}
      <WalkInLoggerModal open={walkInOpen} onClose={closeWalkIn} />
      <ExpenseAndSaleModal open={financialsOpen} onClose={() => setFinancialsOpen(false)} />
      <ToastHost />
    </div>
  );
};

export default App;
