import React from "react";
import type { InventoryUnit } from "../../../hooks/useInventoryQueries";
interface ChassisDataTableProps {
    units: InventoryUnit[];
    selectedStatus: string;
    onStatusFilter: (value: string) => void;
    onRepair: (unit: InventoryUnit) => void;
    onCustody: (unit: InventoryUnit) => void;
    onChangeSaleStatus: (unit: InventoryUnit) => void;
}
declare const ChassisDataTable: React.FC<ChassisDataTableProps>;
export default ChassisDataTable;
