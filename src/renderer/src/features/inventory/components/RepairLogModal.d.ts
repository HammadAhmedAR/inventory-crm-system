import React from "react";
import type { InventoryUnit } from "../../../hooks/useInventoryQueries";
interface RepairLogModalProps {
    open: boolean;
    selectedUnit: InventoryUnit | null;
    onClose: () => void;
    onSave: (payload: {
        chassisNumber: string;
        issueCategory: string;
        description: string;
        costIncurred: number;
    }) => Promise<void> | void;
    onResolveAll: (chassisNumber: string) => Promise<void> | void;
}
declare const RepairLogModal: React.FC<RepairLogModalProps>;
export default RepairLogModal;
