import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";

export interface Liability {
  id: string;
  player_id: string;
  name: string;
  type: string;
  balance: number;
  original_amount: number;
  interest_rate: number;
  minimum_payment: number;
  month_started: number;
  payoff_progress: number;
  created_at: string;
  updated_at: string;
}

/** GET /liabilities - returns all liabilities ordered by interest rate
 * descending, each with a computed payoff_progress (0-100). */
export const getLiabilities = async (): Promise<Liability[]> => {
  const res = await api.get<ApiResponse<Liability[]>>("/liabilities");
  return res.data.data;
};
