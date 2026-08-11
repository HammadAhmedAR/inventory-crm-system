import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  badge?: string;
  badgeType?: "success" | "accent" | "muted";
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  badge,
  badgeType = "muted",
  icon,
}) => (
  <div className="card p-5 hover:shadow-card-hover transition-all duration-200 group">
    <div className="flex items-start justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      {badge && (
        <span
          className={
            badgeType === "success"
              ? "badge-success"
              : badgeType === "accent"
                ? "badge-accent"
                : "badge-muted"
          }
        >
          {badge}
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    <p className="text-muted text-sm mt-1">{label}</p>
  </div>
);

const WorkbenchPage: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📊</span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Workbench
          </h2>
          <span className="badge-success">Live</span>
        </div>
        <p className="text-muted text-sm">
          Daily operations overview, KPIs, and dealership performance at a
          glance.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="🚗"
          label="Vehicles In Stock"
          value="142"
          badge="+12 this week"
          badgeType="success"
        />
        <StatCard
          icon="💰"
          label="Revenue MTD"
          value="$1.2M"
          badge="▲ 18%"
          badgeType="success"
        />
        <StatCard
          icon="👥"
          label="Active Prospects"
          value="38"
          badge="Hot leads"
          badgeType="accent"
        />
        <StatCard
          icon="🔧"
          label="In Repair Bay"
          value="9"
          badge="3 urgent"
          badgeType="muted"
        />
      </div>

      {/* Placeholder content area */}
      <div className="card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-3xl">
          📊
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          Workbench Dashboard
        </h3>
        <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
          Charts, recent activity feed, today&apos;s appointments, and deal
          pipeline will render here in Phase 2. The foundation layout and
          navigation are fully functional.
        </p>
        <div className="flex gap-2 justify-center mt-6">
          <span className="badge-muted">Phase 1 ✓ Complete</span>
          <span className="badge-accent">Phase 2 — Charts & Feed</span>
        </div>
      </div>
    </div>
  );
};

export default WorkbenchPage;
