import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";

export interface SimulationOutput {
  id: string;
  player_id: string;
  month: number;
  year: number;
  inflation_rate: number;
  interest_rate: number;
  gdp_growth: number;
  unemployment_rate: number;
  exchange_rate: number;
  market_index: number;
  created_at: string;
}

/** POST /simulation/advance - advances the simulation by one month,
 * ticks all market indicators with Gaussian noise, and returns the
 * newly created Simulation row. */
export const advanceMonth = async (): Promise<SimulationOutput> => {
  const res = await api.post<ApiResponse<SimulationOutput>>(
    "/simulation/advance"
  );
  return res.data.data;
};
