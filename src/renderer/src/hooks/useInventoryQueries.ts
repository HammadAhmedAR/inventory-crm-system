import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type InventorySaleStatus = "AVAILABLE" | "RESERVED" | "SOLD";
export type InventoryHealthStatus =
  | "READY_FOR_SALE"
  | "UNDER_REPAIR"
  | "NEEDS_REPAIR"
  | "PENDING_CHECK";

export type InventoryFilter = {
  status?: string;
  search?: string;
  make?: string;
  modelId?: string;
  modelName?: string;
  bodyType?: string;
  saleStatus?: string;
  healthStatus?: string;
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
  engineNumber: string | null;
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
    bodyType: string;
  };
  repairs: InventoryRepairLog[];
  salesRecord: {
    id: string;
    finalSalePrice: number;
    saleDate: string;
  } | null;
}

export function useInventoryList(filters?: InventoryFilter) {
  return useQuery({
    queryKey: ["inventoryList", filters ?? {}],
    queryFn: async () => {
      return window.api.inventory.getAll(filters ?? {});
    },
  });
}

export function useCreateInventoryUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: window.api.inventory.addUnit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventoryList"] }),
  });
}

export function useUpdateChassisStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      chassisNumber: string;
      saleStatus?: InventorySaleStatus;
      healthStatus?: InventoryHealthStatus;
    }) => {
      return window.api.inventory.updateStatus(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryList"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useLogRepairIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      chassisNumber: string;
      issueCategory: string;
      description: string;
      costIncurred?: number;
      repairStatus?: string;
    }) => {
      return window.api.inventory.logRepair(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryList"] });
    },
  });
}

export function useUpdateCustodyChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      chassisNumber: string;
      keysCount: number;
      documentsPresent: boolean;
    }) => {
      return window.api.inventory.updateCustody(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventoryList"] });
    },
  });
}
