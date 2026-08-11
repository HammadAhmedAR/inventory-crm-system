import { PrismaClient } from "@prisma/client";
export type InventoryFilters = {
    status?: string;
    search?: string;
};
export declare function getInventoryUnits(prisma: PrismaClient, filters?: InventoryFilters): Promise<({
    model: {
        id: string;
        make: string;
        modelName: string;
        year: number;
        createdAt: Date;
    };
    repairs: {
        id: string;
        chassisNumber: string;
        loggedAt: Date;
        issueCategory: string;
        description: string;
        repairStatus: string;
        costIncurred: number;
        resolvedAt: Date | null;
    }[];
    salesRecord: {
        id: string;
        createdAt: Date;
        chassisNumber: string;
        notes: string | null;
        customerId: string;
        saleDate: Date;
        finalSalePrice: number;
        paymentMethod: string;
    } | null;
} & {
    createdAt: Date;
    color: string;
    chassisNumber: string;
    modelId: string;
    engineNumber: string | null;
    baseQuotingPrice: number;
    minSellingPrice: number | null;
    costPrice: number | null;
    saleStatus: string;
    healthStatus: string;
    keysCount: number;
    documentsPresent: boolean;
    updatedAt: Date;
})[]>;
export declare function updateChassisStatus(prisma: PrismaClient, data: {
    chassisNumber: string;
    saleStatus?: string;
    healthStatus?: string;
}): Promise<{
    model: {
        id: string;
        make: string;
        modelName: string;
        year: number;
        createdAt: Date;
    };
    repairs: {
        id: string;
        chassisNumber: string;
        loggedAt: Date;
        issueCategory: string;
        description: string;
        repairStatus: string;
        costIncurred: number;
        resolvedAt: Date | null;
    }[];
    salesRecord: {
        id: string;
        createdAt: Date;
        chassisNumber: string;
        notes: string | null;
        customerId: string;
        saleDate: Date;
        finalSalePrice: number;
        paymentMethod: string;
    } | null;
} & {
    createdAt: Date;
    color: string;
    chassisNumber: string;
    modelId: string;
    engineNumber: string | null;
    baseQuotingPrice: number;
    minSellingPrice: number | null;
    costPrice: number | null;
    saleStatus: string;
    healthStatus: string;
    keysCount: number;
    documentsPresent: boolean;
    updatedAt: Date;
}>;
export declare function logRepairIssue(prisma: PrismaClient, data: {
    chassisNumber: string;
    issueCategory?: string;
    description: string;
    costIncurred?: number | string;
    repairStatus?: string;
}): Promise<{
    log: {
        id: string;
        chassisNumber: string;
        loggedAt: Date;
        issueCategory: string;
        description: string;
        repairStatus: string;
        costIncurred: number;
        resolvedAt: Date | null;
    };
    chassis: ({
        model: {
            id: string;
            make: string;
            modelName: string;
            year: number;
            createdAt: Date;
        };
        repairs: {
            id: string;
            chassisNumber: string;
            loggedAt: Date;
            issueCategory: string;
            description: string;
            repairStatus: string;
            costIncurred: number;
            resolvedAt: Date | null;
        }[];
        salesRecord: {
            id: string;
            createdAt: Date;
            chassisNumber: string;
            notes: string | null;
            customerId: string;
            saleDate: Date;
            finalSalePrice: number;
            paymentMethod: string;
        } | null;
    } & {
        createdAt: Date;
        color: string;
        chassisNumber: string;
        modelId: string;
        engineNumber: string | null;
        baseQuotingPrice: number;
        minSellingPrice: number | null;
        costPrice: number | null;
        saleStatus: string;
        healthStatus: string;
        keysCount: number;
        documentsPresent: boolean;
        updatedAt: Date;
    }) | null;
}>;
export declare function updateCustodyChecklist(prisma: PrismaClient, data: {
    chassisNumber: string;
    keysCount?: number | string;
    documentsPresent?: boolean;
}): Promise<{
    model: {
        id: string;
        make: string;
        modelName: string;
        year: number;
        createdAt: Date;
    };
    repairs: {
        id: string;
        chassisNumber: string;
        loggedAt: Date;
        issueCategory: string;
        description: string;
        repairStatus: string;
        costIncurred: number;
        resolvedAt: Date | null;
    }[];
    salesRecord: {
        id: string;
        createdAt: Date;
        chassisNumber: string;
        notes: string | null;
        customerId: string;
        saleDate: Date;
        finalSalePrice: number;
        paymentMethod: string;
    } | null;
} & {
    createdAt: Date;
    color: string;
    chassisNumber: string;
    modelId: string;
    engineNumber: string | null;
    baseQuotingPrice: number;
    minSellingPrice: number | null;
    costPrice: number | null;
    saleStatus: string;
    healthStatus: string;
    keysCount: number;
    documentsPresent: boolean;
    updatedAt: Date;
}>;
