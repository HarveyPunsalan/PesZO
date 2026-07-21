import { useQuery } from "@tanstack/react-query";
import { getLiabilities } from "./liabilities.api";

// Shared between DashboardPage (Net Worth calculation) and the future
// Liabilities page. One cache entry, one invalidation target.
export function useLiabilities() {
  return useQuery({
    queryKey: ["liabilities"],
    queryFn: getLiabilities,
  });
}
