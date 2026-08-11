import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/** Fetch all follow-up tasks */
export function useDailyTasks() {
  return useQuery({
    queryKey: ["dailyTasks"],
    queryFn: async () => {
      return window.api.crm.getTasks();
    },
  });
}

export function useCustomers(search = "") {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () => window.api.crm.getCustomers(search),
  });
}

/** Log a new walk-in prospect details */
export function useQuickLogLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      phone: string;
      chassisNumber?: string;
      quotedPrice?: number;
      customerRemark?: string;
      actionTag?: string;
      dueDate?: string;
    }) => {
      return window.api.crm.quickLog(data);
    },
    onSuccess: (result) => {
      // Invalidate queries to refresh list data
      queryClient.invalidateQueries({ queryKey: ["dailyTasks"] });
      queryClient.invalidateQueries({ queryKey: ["availableVehicles"] });
      queryClient.invalidateQueries({ queryKey: ["financialSummary"] });
      if (result?.customerId) {
        queryClient.invalidateQueries({ queryKey: ["customerTimeline", result.customerId] });
      }
    },
  });
}

/** Complete an active task */
export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      return window.api.crm.completeTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyTasks"] });
    },
  });
}

/** Fetch customer profile timeline logs */
export function useCustomerTimeline(customerId: string | null) {
  return useQuery({
    queryKey: ["customerTimeline", customerId],
    queryFn: async () => {
      if (!customerId) return null;
      return window.api.crm.getCustomerTimeline(customerId);
    },
    enabled: !!customerId,
  });
}

/** Fetch all available inventory vehicles */
export function useAvailableVehicles() {
  return useQuery({
    queryKey: ["availableVehicles"],
    queryFn: async () => {
      return window.api.crm.getAvailableVehicles();
    },
  });
}

/** Add a custom interaction remark to active customer timeline */
export function useAddRemark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { customerId: string; remark: string; actionTag: string }) => {
      return window.api.crm.addRemark(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customerTimeline", variables.customerId] });
    },
  });
}
