import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RecycleEntityType } from "../../../shared/ipc";

const refreshKeys = ["recycleBin", "inventoryList", "customers", "customerTimeline", "availableVehicles", "agreementOptions", "tasks", "dailyTasks", "financialSummary", "dailyExpenses", "reports"];
export const invalidateDeletedData = (client: ReturnType<typeof useQueryClient>) => Promise.all(refreshKeys.map((key) => client.invalidateQueries({ queryKey: [key] })));

export function useRecycleBin(entityType?: RecycleEntityType) {
  return useQuery({ queryKey: ["recycleBin", entityType ?? "ALL"], queryFn: () => window.api.recyclebin.getDeleted(entityType) });
}

export function useSoftDelete() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (data: { entityType: RecycleEntityType; id: string }) => window.api.recyclebin.softDelete(data).then(() => data), onSuccess: async (data) => { await invalidateDeletedData(client); window.dispatchEvent(new CustomEvent("omnidrive:toast", { detail: { message: "Item moved to Recycle Bin.", actionLabel: "Undo", action: async () => { await window.api.recyclebin.restore(data); await invalidateDeletedData(client); } } })); } });
}
