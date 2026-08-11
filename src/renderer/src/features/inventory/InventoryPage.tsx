import React, { useEffect, useMemo, useState } from "react";
import {
  useInventoryList,
  useLogRepairIssue,
  useUpdateChassisStatus,
  useUpdateCustodyChecklist,
  type InventoryUnit,
} from "../../hooks/useInventoryQueries";
import ChassisDataTable from "./components/ChassisDataTable";
import DocumentChecklist from "./components/DocumentChecklist";
import RepairLogModal from "./components/RepairLogModal";
import AddUnitModal from "./components/AddUnitModal";

const InventoryPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [makeFilter, setMakeFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [bodyTypeFilter, setBodyTypeFilter] = useState("");
  const [saleStatusFilter, setSaleStatusFilter] = useState("ALL");
  const [selectedUnit, setSelectedUnit] = useState<InventoryUnit | null>(null);
  const [repairOpen, setRepairOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [addUnitOpen, setAddUnitOpen] = useState(false);

  const { data: units = [], isLoading, error } = useInventoryList({
    healthStatus: statusFilter === "ALL" ? undefined : statusFilter,
    search: searchText,
    make: makeFilter || undefined,
    modelId: modelFilter || undefined,
    bodyType: bodyTypeFilter || undefined,
    saleStatus: saleStatusFilter === "ALL" ? undefined : saleStatusFilter,
  });
  const { data: allUnits = [] } = useInventoryList();

  const updateStatusMutation = useUpdateChassisStatus();
  const logRepairMutation = useLogRepairIssue();
  const updateCustodyMutation = useUpdateCustodyChecklist();

  const stats = useMemo(() => {
    const total = allUnits.length;
    const floorReady = allUnits.filter((unit) => unit.healthStatus === "READY_FOR_SALE").length;
    const underRepair = allUnits.filter((unit) => ["UNDER_REPAIR", "NEEDS_REPAIR", "PENDING_CHECK"].includes(unit.healthStatus)).length;
    const reserved = allUnits.filter((unit) => unit.saleStatus === "RESERVED").length;

    return { total, floorReady, underRepair, reserved };
  }, [allUnits]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = document.getElementById("inventory-search");
        input?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenRepair = (unit: InventoryUnit) => {
    setSelectedUnit(unit);
    setRepairOpen(true);
  };

  const handleOpenChecklist = (unit: InventoryUnit) => {
    setSelectedUnit(unit);
    setChecklistOpen(true);
  };

  const handleChangeSaleStatus = async (unit: InventoryUnit) => {
    const nextStatus = unit.saleStatus === "AVAILABLE" ? "RESERVED" : unit.saleStatus === "RESERVED" ? "SOLD" : "AVAILABLE";
    await updateStatusMutation.mutateAsync({
      chassisNumber: unit.chassisNumber,
      saleStatus: nextStatus,
    });
  };

  const handleSaveRepair = async (payload: {
    chassisNumber: string;
    issueCategory: string;
    description: string;
    costIncurred: number;
  }) => {
    await logRepairMutation.mutateAsync({
      ...payload,
      repairStatus: "PENDING",
    });
    setRepairOpen(false);
    setSelectedUnit(null);
  };

  const handleResolveAll = async (chassisNumber: string) => {
    await updateStatusMutation.mutateAsync({
      chassisNumber,
      healthStatus: "READY_FOR_SALE",
    });
    setRepairOpen(false);
    setSelectedUnit(null);
  };

  const handleSaveCustody = async (payload: {
    chassisNumber: string;
    keysCount: number;
    documentsPresent: boolean;
  }) => {
    await updateCustodyMutation.mutateAsync(payload);
    setChecklistOpen(false);
    setSelectedUnit(null);
  };

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-subtle">Operations</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">Inventory & Vehicle Health</h2>
        </div>
        <button type="button" className="btn-accent" onClick={() => setAddUnitOpen(true)}>+ Add Unit</button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          { label: "Total Units", value: stats.total, accent: "text-white" },
          { label: "Floor Ready", value: stats.floorReady, accent: "text-emerald-300" },
          { label: "Under Repair", value: stats.underRepair, accent: "text-red-300" },
          { label: "Reserved", value: stats.reserved, accent: "text-violet-300" },
        ].map((stat) => (
          <div key={stat.label} className="card px-4 py-3">
            <div className={`text-2xl font-bold ${stat.accent}`}>{stat.value}</div>
            <div className="text-xs uppercase tracking-[0.18em] text-subtle">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <input
            id="inventory-search"
            type="search"
            placeholder="Search chassis, color, model, or make…"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="input-dark w-full pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-elevated px-1 text-[10px] text-subtle">
            Ctrl+K
          </span>
        </div>
      </div>

      {error ? (
        <div className="card flex min-h-[220px] items-center justify-center text-red-300">
          Unable to load inventory: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : isLoading ? (
        <div className="card flex min-h-[220px] items-center justify-center text-muted">Loading inventory…</div>
      ) : (
        <ChassisDataTable
          units={units}
          allUnits={allUnits}
          search={searchText}
          makeFilter={makeFilter}
          modelFilter={modelFilter}
          bodyTypeFilter={bodyTypeFilter}
          saleStatusFilter={saleStatusFilter}
          onSearch={setSearchText}
          onMakeFilter={(value) => { setMakeFilter(value); setModelFilter(""); }}
          onModelFilter={setModelFilter}
          onBodyTypeFilter={setBodyTypeFilter}
          onSaleStatusFilter={setSaleStatusFilter}
          selectedStatus={statusFilter}
          onStatusFilter={setStatusFilter}
          onRepair={handleOpenRepair}
          onCustody={handleOpenChecklist}
          onChangeSaleStatus={handleChangeSaleStatus}
        />
      )}

      <RepairLogModal
        open={repairOpen}
        selectedUnit={selectedUnit}
        onClose={() => {
          setRepairOpen(false);
          setSelectedUnit(null);
        }}
        onSave={handleSaveRepair}
        onResolveAll={handleResolveAll}
      />

      <DocumentChecklist
        open={checklistOpen}
        selectedChassis={selectedUnit ? {
          chassisNumber: selectedUnit.chassisNumber,
          keysCount: selectedUnit.keysCount,
          documentsPresent: selectedUnit.documentsPresent,
        } : null}
        onClose={() => {
          setChecklistOpen(false);
          setSelectedUnit(null);
        }}
        onSave={handleSaveCustody}
      />
      <AddUnitModal open={addUnitOpen} onClose={() => setAddUnitOpen(false)} />
    </div>
  );
};

export default InventoryPage;
