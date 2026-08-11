export type InventorySaleStatus = "AVAILABLE" | "RESERVED" | "SOLD";
export type InventoryHealthStatus = "READY_FOR_SALE" | "UNDER_REPAIR" | "NEEDS_REPAIR" | "PENDING_CHECK";
export type InventoryFilter = {
    status?: string;
    search?: string;
};
export interface InventoryRepairLog {
    id: string;
    chassisNumber: string;
    issueCategory: string;
    description: string;
    repairStatus: string;
    costIncurred: number;
    loggedAt: string;
    resolvedAt: string | null;
}
export interface InventoryUnit {
    chassisNumber: string;
    color: string;
    saleStatus: InventorySaleStatus;
    healthStatus: InventoryHealthStatus;
    keysCount: number;
    documentsPresent: boolean;
    baseQuotingPrice: number;
    minSellingPrice: number | null;
    createdAt: string;
    updatedAt: string;
    model: {
        id: string;
        make: string;
        modelName: string;
        year: number;
    };
    repairs: InventoryRepairLog[];
    salesRecord: {
        id: string;
        finalSalePrice: number;
        saleDate: string;
    } | null;
}
export declare function useInventoryList(filters?: InventoryFilter): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useUpdateChassisStatus(): import("@tanstack/react-query").UseMutationResult<any, Error, {
    chassisNumber: string;
    saleStatus?: InventorySaleStatus;
    healthStatus?: InventoryHealthStatus;
}, unknown>;
export declare function useLogRepairIssue(): import("@tanstack/react-query").UseMutationResult<any, Error, {
    chassisNumber: string;
    issueCategory: string;
    description: string;
    costIncurred?: number;
    repairStatus?: string;
}, unknown>;
export declare function useUpdateCustodyChecklist(): import("@tanstack/react-query").UseMutationResult<any, Error, {
    chassisNumber: string;
    keysCount: number;
    documentsPresent: boolean;
}, unknown>;
