import { useMutation } from "@tanstack/react-query";
import { advanceMonth } from "@/modules/simulation/simulation.api";
import { queryClient } from "@/lib/queryClient";

export function useAdvanceMonth() {
  return useMutation({
    mutationFn: advanceMonth,
    onSuccess: () => {
      // Intentionally unfiltered: advancing the month changes Player's
      // simulation_month/year, triggers Markets price ticks affecting
      // Portfolio's market_value, and shifts which month Budget/Liabilities
      // calculations apply to. A narrower invalidation would leave
      // Dashboard showing stale Net Worth/Budget numbers until a manual
      // page refresh.
      queryClient.invalidateQueries();
    },
  });
}
