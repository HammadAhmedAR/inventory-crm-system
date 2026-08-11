import type { ElectronAPI } from "@electron-toolkit/preload";

export type Task = {
    id: string;
    customerId: string;
    customer: {
        id: string;
        fullName: string;
        phone: string;
        email: string | null;
    };
    title: string;
    actionType: string;
    dueDate: string;
    dueTime: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
};
export type CustomerTimeline = {
    id: string;
    createdAt: string;
    fullName: string;
    phone: string;
    email: string | null;
    leadSource: string;
    interactions: Array<{
        id: string;
        customerRemark: string;
        salesNote: string | null;
        actionTag: string;
        createdAt: string;
    }>;
    quotes: Array<{
        id: string;
        quotedPrice: number;
        status: string;
        createdAt: string;
        chassis: {
            chassisNumber: string;
            minSellingPrice: number | null;
            model: {
                make: string;
                modelName: string;
                year: number;
            };
        };
    }>;
    sales: Array<{
        id: string;
        finalSalePrice: number;
        paymentMethod: string;
        saleDate: string;
    }>;
};
export type AvailableVehicle = {
    chassisNumber: string;
    model: {
        make: string;
        modelName: string;
        year: number;
    };
};
export type TodayFinancialSummary = {
    revenue: number;
    expenses: number;
    vehiclesSold: number;
    netCashflow: number;
};
export type CustomerSummary = {
    id: string; fullName: string; phone: string; email: string | null; leadSource: string;
    pipelineStage: string; estimatedCloseDate: string | null; lostReason: string | null; lostReasonNotes: string | null; createdAt: string;
    _count: { interactions: number; quotes: number };
    quotes: Array<{ id: string; quotedPrice: number; createdAt: string; chassis: { chassisNumber: string; model: { make: string; modelName: string; year: number } } }>;
};
export type AgreementOption = {
    chassisNumber: string; color: string; saleStatus: string; baseQuotingPrice: number;
    model: { make: string; modelName: string; year: number };
    salesRecord: null | { finalSalePrice: number; paymentMethod: string; customer: { id: string; fullName: string; phone: string; email: string | null } };
    quotes: Array<{ quotedPrice: number; customer: { id: string; fullName: string; phone: string; email: string | null } }>;
};
export type InventoryUnitRow = {
    chassisNumber: string;
    engineNumber: string | null;
    color: string;
    saleStatus: "AVAILABLE" | "RESERVED" | "SOLD";
    healthStatus: "READY_FOR_SALE" | "UNDER_REPAIR" | "NEEDS_REPAIR" | "PENDING_CHECK";
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
        bodyType: string;
    };
    repairs: Array<{
        id: string;
        chassisNumber: string;
        issueCategory: string;
        description: string;
        repairStatus: string;
        costIncurred: number;
        loggedAt: string;
        resolvedAt: string | null;
    }>;
    salesRecord: {
        id: string;
        finalSalePrice: number;
        saleDate: string;
    } | null;
};

declare global {
    interface Window {
        electron: ElectronAPI;
        api: {
            windowControls: {
                minimize: () => void;
                toggleMaximize: () => void;
                close: () => void;
            };
            crm: {
                getCustomers: (search?: string) => Promise<CustomerSummary[]>;
                addProspect: (data: { fullName: string; phone: string; email?: string; leadSource: string; pipelineStage: string; chassisNumber?: string; quotedPrice?: number; remarks?: string; estimatedCloseDate?: string; createdAt?: string }) => Promise<CustomerSummary>;
                updatePipelineStage: (data: { customerId: string; pipelineStage: string; lostReason?: string; lostReasonNotes?: string }) => Promise<CustomerSummary>;
                getTasks: () => Promise<Task[]>;
                quickLog: (data: {
                    fullName: string;
                    phone: string;
                    chassisNumber?: string;
                    quotedPrice?: number;
                    customerRemark?: string;
                    actionTag?: string;
                    dueDate?: string;
                }) => Promise<{ customerId: string }>;
                completeTask: (taskId: string) => Promise<void>;
                getCustomerTimeline: (customerId: string) => Promise<CustomerTimeline>;
                getAvailableVehicles: () => Promise<AvailableVehicle[]>;
                addRemark: (data: {
                    customerId: string;
                    remark: string;
                    actionTag: string;
                }) => Promise<void>;
            };
            inventory: {
                addUnit: (data: { chassisNumber: string; engineNumber?: string; make: string; modelName: string; bodyType: string; year: number; color: string; baseQuotingPrice: number; minSellingPrice?: number; costPrice?: number; keysCount: number; documentsPresent: boolean }) => Promise<InventoryUnitRow>;
                getAll: (filters?: { status?: string; search?: string; make?: string; modelId?: string; modelName?: string; bodyType?: string; saleStatus?: string; healthStatus?: string }) => Promise<InventoryUnitRow[]>;
                updateStatus: (data: {
                    chassisNumber: string;
                    saleStatus?: string;
                    healthStatus?: string;
                }) => Promise<InventoryUnitRow>;
                logRepair: (data: {
                    chassisNumber: string;
                    issueCategory?: string;
                    description: string;
                    costIncurred?: number | string;
                    repairStatus?: string;
                }) => Promise<{ chassis: InventoryUnitRow | null }>;
                updateCustody: (data: {
                    chassisNumber: string;
                    keysCount?: number | string;
                    documentsPresent?: boolean;
                }) => Promise<InventoryUnitRow>;
            };
            financials: {
                getTodaySummary: () => Promise<TodayFinancialSummary>;
                logExpense: (data: { category: string; description: string; amount: number; loggedBy?: string }) => Promise<unknown>;
                recordSale: (data: { customerId: string; chassisNumber: string; finalSalePrice: number; paymentMethod: string; notes?: string }) => Promise<unknown>;
            };
            auth: { verifyPin: (pin: string) => Promise<boolean> };
            agreements: {
                getOptions: () => Promise<AgreementOption[]>;
                generatePdf: (data: { agreementId: string; chassisNumber: string; customerId: string; salePrice: number; paymentMethod: string; notes?: string }) => Promise<{ filePath: string }>;
                openPdf: (filePath: string) => Promise<void>;
            };
        };
    }
}
