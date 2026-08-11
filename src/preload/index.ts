import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

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

// Expose the API to the renderer
const api = {
  windowControls: {
    minimize: () => ipcRenderer.send("window:minimize"),
    toggleMaximize: () => ipcRenderer.send("window:toggle-maximize"),
    close: () => ipcRenderer.send("window:close"),
  },
  crm: {
    getCustomers: (search?: string) => ipcRenderer.invoke("crm:getCustomers", search ?? ""),
    addProspect: (data: { fullName: string; phone: string; email?: string; leadSource: string; pipelineStage: string; chassisNumber?: string; quotedPrice?: number; remarks?: string; estimatedCloseDate?: string; createdAt?: string }) => ipcRenderer.invoke("crm:add-prospect", data),
    updatePipelineStage: (data: { customerId: string; pipelineStage: string; lostReason?: string; lostReasonNotes?: string }) => ipcRenderer.invoke("crm:update-pipeline-stage", data),
    getTasks: () => ipcRenderer.invoke("crm:getTasks"),
    quickLog: (data: {
      fullName: string;
      phone: string;
      chassisNumber?: string;
      quotedPrice?: number;
      customerRemark?: string;
      actionTag?: string;
      dueDate?: string;
    }) => ipcRenderer.invoke("crm:quickLog", data),
    completeTask: (taskId: string) => ipcRenderer.invoke("crm:completeTask", taskId),
    getCustomerTimeline: (customerId: string) =>
      ipcRenderer.invoke("crm:getCustomerTimeline", customerId),
    getAvailableVehicles: () => ipcRenderer.invoke("crm:getAvailableVehicles"),
    addRemark: (data: { customerId: string; remark: string; actionTag: string }) =>
      ipcRenderer.invoke("crm:addRemark", data),
  },
  inventory: {
    addUnit: (data: { chassisNumber: string; engineNumber?: string; make: string; modelName: string; bodyType: string; year: number; color: string; baseQuotingPrice: number; minSellingPrice?: number; costPrice?: number; keysCount: number; documentsPresent: boolean }) => ipcRenderer.invoke("inventory:add-unit", data),
    getAll: (filters?: { status?: string; search?: string; make?: string; modelId?: string; modelName?: string; bodyType?: string; saleStatus?: string; healthStatus?: string }) =>
      ipcRenderer.invoke("inventory:get-all", filters ?? {}),
    updateStatus: (data: {
      chassisNumber: string;
      saleStatus?: string;
      healthStatus?: string;
    }) => ipcRenderer.invoke("inventory:update-status", data),
    logRepair: (data: {
      chassisNumber: string;
      issueCategory?: string;
      description: string;
      costIncurred?: number | string;
      repairStatus?: string;
    }) => ipcRenderer.invoke("inventory:log-repair", data),
    updateCustody: (data: {
      chassisNumber: string;
      keysCount?: number | string;
      documentsPresent?: boolean;
    }) => ipcRenderer.invoke("inventory:update-custody", data),
  },
  financials: {
    getTodaySummary: () => ipcRenderer.invoke("financials:getTodaySummary"),
    logExpense: (data: { category: string; description: string; amount: number; loggedBy?: string }) => ipcRenderer.invoke("financials:log-expense", data),
    recordSale: (data: { customerId: string; chassisNumber: string; finalSalePrice: number; paymentMethod: string; notes?: string }) => ipcRenderer.invoke("financials:record-sale", data),
  },
  auth: { verifyPin: (pin: string) => ipcRenderer.invoke("auth:verify-pin", pin) },
  agreements: {
    getOptions: () => ipcRenderer.invoke("agreements:get-options"),
    generatePdf: (data: { agreementId: string; chassisNumber: string; customerId: string; salePrice: number; paymentMethod: string; notes?: string }) => ipcRenderer.invoke("agreements:generate-pdf", data),
    openPdf: (filePath: string) => ipcRenderer.invoke("agreements:open-pdf", filePath),
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in d.ts)
  window.electron = electronAPI;
  // @ts-ignore (define in d.ts)
  window.api = api;
}
