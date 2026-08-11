export interface CreateProspectPayload {
  fullName: string;
  phone: string;
  email?: string;
  leadSource: string;
  pipelineStage: string;
  chassisNumber?: string;
  quotedPrice?: number;
  vehicleInterests?: Array<{ chassisNumber: string; quotedPrice: number; isPrimary: boolean }>;
  remarks?: string;
  estimatedCloseDate?: string;
  createdAt?: string | Date;
}

export type ReportType = "INVENTORY" | "CRM" | "SALES" | "EXPENSES";
export type ReportFormat = "CSV" | "XLSX";
export type ReportTimeframe = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM";

export interface ReportFilterPayload {
  reportType: ReportType;
  format?: ReportFormat;
  timeframe: ReportTimeframe;
  startDate?: string;
  endDate?: string;
  make?: string;
  model?: string;
  bodyType?: string;
  status?: string;
  leadSource?: string;
  pipelineStage?: string;
}

export type ReportRow = Record<string, string | number | boolean | null>;

export interface ReportExportResult {
  success: boolean;
  canceled?: boolean;
  filePath?: string;
  recordCount?: number;
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export interface DealershipProfileData {
  id: string;
  companyName: string;
  regNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
}

export type DealershipProfileInput = Omit<DealershipProfileData, "id">;

export interface TaskFilters {
  timeline?: "ALL" | "OVERDUE" | "TODAY" | "UPCOMING" | "COMPLETED";
  category?: "ALL" | "SALES" | "INVENTORY";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export interface CreateTaskPayload {
  customerId?: string;
  chassisNumber?: string;
  title: string;
  actionType: "CALL" | "WHATSAPP" | "REPAIR_DISPATCH" | "DOCUMENT_CHECK" | "VISIT";
  taskType: "SALES" | "INVENTORY_REPAIR" | "DOCUMENT_CHECK";
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  dueTime?: string;
  notes?: string;
}

export interface UnifiedTask {
  id: string;
  customerId: string | null;
  chassisNumber: string | null;
  title: string;
  actionType: string;
  taskType: string;
  priority: string;
  dueDate: string;
  dueTime: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  customer: null | {
    id: string; fullName: string; phone: string; email: string | null;
    quotes: Array<{ quotedPrice: number; chassis: { chassisNumber: string; model: { make: string; modelName: string; year: number } } }>;
  };
  chassis: null | {
    chassisNumber: string; healthStatus: string;
    model: { make: string; modelName: string; year: number };
    repairs: Array<{ description: string; repairStatus: string }>;
  };
}

export type RecycleEntityType = "VEHICLE" | "CUSTOMER" | "TASK" | "EXPENSE";
export interface RecycleBinItem {
  id: string;
  entityType: RecycleEntityType;
  title: string;
  subtitle: string;
  detail?: string;
  deletedAt: string;
  originalDate?: string;
}
