import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Fetch today's financial summary */
export function useTodayFinancialSummary() {
  return useQuery({
    queryKey: ["financialSummary"],
    queryFn: async () => {
      return window.api.financials.getTodaySummary();
    },
  });
}
export function useDailyExpenses() { return useQuery({ queryKey: ["dailyExpenses"], queryFn: window.api.financials.getDailyExpenses }); }

export function useLogExpense() {
  const client = useQueryClient();
  return useMutation({ mutationFn: window.api.financials.logExpense, onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: ["financialSummary"] }), client.invalidateQueries({ queryKey: ["dailyExpenses"] })]) });
}

export function useRecordSale() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: window.api.financials.recordSale,
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: ["financialSummary"] }),
      client.invalidateQueries({ queryKey: ["inventoryList"] }),
      client.invalidateQueries({ queryKey: ["agreementOptions"] }),
      client.invalidateQueries({ queryKey: ["customers"] }),
    ]),
  });
}
