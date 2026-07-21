import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";

export interface BudgetSummary {
  total_income: number;
  total_expenses: number;
  net_cash_flow: number;
  savings_rate: number;
}

/** GET /budget/summary?month=&year= - returns computed totals
 * (income, expenses, net cash flow, savings rate) for a given month. */
export const getBudgetSummary = async (
  month: number,
  year: number
): Promise<BudgetSummary> => {
  const res = await api.get<ApiResponse<BudgetSummary>>("/budget/summary", {
    params: { month, year },
  });
  return res.data.data;
};
