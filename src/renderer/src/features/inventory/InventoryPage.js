import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useInventoryList, useLogRepairIssue, useUpdateChassisStatus, useUpdateCustodyChecklist, } from "../../hooks/useInventoryQueries";
import ChassisDataTable from "./components/ChassisDataTable";
import DocumentChecklist from "./components/DocumentChecklist";
import RepairLogModal from "./components/RepairLogModal";
const InventoryPage = () => {
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchText, setSearchText] = useState("");
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [repairOpen, setRepairOpen] = useState(false);
    const [checklistOpen, setChecklistOpen] = useState(false);
    const { data: units = [], isLoading, error } = useInventoryList({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: searchText,
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
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                const input = document.getElementById("inventory-search");
                input?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    const handleOpenRepair = (unit) => {
        setSelectedUnit(unit);
        setRepairOpen(true);
    };
    const handleOpenChecklist = (unit) => {
        setSelectedUnit(unit);
        setChecklistOpen(true);
    };
    const handleChangeSaleStatus = async (unit) => {
        const nextStatus = unit.saleStatus === "AVAILABLE" ? "RESERVED" : unit.saleStatus === "RESERVED" ? "SOLD" : "AVAILABLE";
        await updateStatusMutation.mutateAsync({
            chassisNumber: unit.chassisNumber,
            saleStatus: nextStatus,
        });
    };
    const handleSaveRepair = async (payload) => {
        await logRepairMutation.mutateAsync({
            ...payload,
            repairStatus: "PENDING",
        });
        setRepairOpen(false);
        setSelectedUnit(null);
    };
    const handleResolveAll = async (chassisNumber) => {
        await updateStatusMutation.mutateAsync({
            chassisNumber,
            healthStatus: "READY_FOR_SALE",
        });
        setRepairOpen(false);
        setSelectedUnit(null);
    };
    const handleSaveCustody = async (payload) => {
        await updateCustodyMutation.mutateAsync(payload);
        setChecklistOpen(false);
        setSelectedUnit(null);
    };
    return (_jsxs("div", { className: "h-full overflow-y-auto p-6 animate-fade-in", children: [_jsxs("div", { className: "mb-6 flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.22em] text-subtle", children: "Operations" }), _jsx("h2", { className: "text-2xl font-bold text-white tracking-tight", children: "Inventory & Vehicle Health" })] }), _jsx("button", { type: "button", className: "btn-accent", children: "+ Add Unit" })] }), _jsx("div", { className: "mb-6 grid grid-cols-1 gap-3 md:grid-cols-4", children: [
                    { label: "Total Units", value: stats.total, accent: "text-white" },
                    { label: "Floor Ready", value: stats.floorReady, accent: "text-emerald-300" },
                    { label: "Under Repair", value: stats.underRepair, accent: "text-red-300" },
                    { label: "Reserved", value: stats.reserved, accent: "text-violet-300" },
                ].map((stat) => (_jsxs("div", { className: "card px-4 py-3", children: [_jsx("div", { className: `text-2xl font-bold ${stat.accent}`, children: stat.value }), _jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-subtle", children: stat.label })] }, stat.label))) }), _jsx("div", { className: "mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: _jsxs("div", { className: "relative flex-1", children: [_jsx("input", { id: "inventory-search", type: "search", placeholder: "Search chassis, color, model, or make\u2026", value: searchText, onChange: (event) => setSearchText(event.target.value), className: "input-dark w-full pr-10" }), _jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-elevated px-1 text-[10px] text-subtle", children: "Ctrl+K" })] }) }), error ? (_jsxs("div", { className: "card flex min-h-[220px] items-center justify-center text-red-300", children: ["Unable to load inventory: ", error instanceof Error ? error.message : "Unknown error"] })) : isLoading ? (_jsx("div", { className: "card flex min-h-[220px] items-center justify-center text-muted", children: "Loading inventory\u2026" })) : (_jsx(ChassisDataTable, { units: units, selectedStatus: statusFilter, onStatusFilter: setStatusFilter, onRepair: handleOpenRepair, onCustody: handleOpenChecklist, onChangeSaleStatus: handleChangeSaleStatus })), _jsx(RepairLogModal, { open: repairOpen, selectedUnit: selectedUnit, onClose: () => {
                    setRepairOpen(false);
                    setSelectedUnit(null);
                }, onSave: handleSaveRepair, onResolveAll: handleResolveAll }), _jsx(DocumentChecklist, { open: checklistOpen, selectedChassis: selectedUnit ? {
                    chassisNumber: selectedUnit.chassisNumber,
                    keysCount: selectedUnit.keysCount,
                    documentsPresent: selectedUnit.documentsPresent,
                } : null, onClose: () => {
                    setChecklistOpen(false);
                    setSelectedUnit(null);
                }, onSave: handleSaveCustody })] }));
};
export default InventoryPage;
