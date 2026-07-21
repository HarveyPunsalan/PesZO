import { useQuery } from "@tanstack/react-query";
import { getPortfolioHoldings, getTransactions } from "./portfolio.api";

// Shared between DashboardPage (Net Worth card) and the future
// Portfolio page. One cache entry, one invalidation target.
export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio-holdings"],
    queryFn: getPortfolioHoldings,
  });
}

// Separate query key from holdings - different data shapes,
// different invalidation semantics. Enabled gate prevents firing
// until player's simulation month/year are available.
export function useTransactions(
  month: number | undefined,
  year: number | undefined,
) {
  return useQuery({
    queryKey: ["portfolio-transactions", month, year],
    queryFn: () => getTransactions(month!, year!),
    enabled: month !== undefined && year !== undefined,
  });
}
