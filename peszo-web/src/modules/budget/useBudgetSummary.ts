import { useQuery } from "@tanstack/react-query";
import { getBudgetSummary } from "./budget.api";

// Key includes month/year so the cache holds separate entries per
// simulation period. Enabled gate prevents firing with undefined
// player data - the query waits until usePlayer() has loaded.
export function useBudgetSummary(
  month: number | undefined,
  year: number | undefined,
) {
  return useQuery({
    queryKey: ["budget-summary", month, year],
    queryFn: () => getBudgetSummary(month!, year!),
    enabled: month !== undefined && year !== undefined,
  });
}
