export interface CreateProspectPayload {
  fullName: string;
  phone: string;
  email?: string;
  leadSource: string;
  pipelineStage: string;
  chassisNumber?: string;
  quotedPrice?: number;
  remarks?: string;
  estimatedCloseDate?: string;
  createdAt?: string | Date;
}
