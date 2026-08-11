import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
export function useInventoryList(filters) {
    return useQuery({
        queryKey: ["inventoryList", filters ?? {}],
        queryFn: async () => {
            return window.api.inventory.getAll(filters ?? {});
        },
    });
}
export function useUpdateChassisStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            return window.api.inventory.updateStatus(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventoryList"] });
        },
    });
}
export function useLogRepairIssue() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
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
        mutationFn: async (data) => {
            return window.api.inventory.updateCustody(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventoryList"] });
        },
    });
}
