import { useQuery } from "@tanstack/react-query";
/** Fetch today's financial summary */
export function useTodayFinancialSummary() {
    return useQuery({
        queryKey: ["financialSummary"],
        queryFn: async () => {
            return window.api.financials.getTodaySummary();
        },
    });
}
