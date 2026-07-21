import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";

export interface PlayerProfile {
  id: string;
  user_id: string;
  name: string;
  simulation_month: number;
  simulation_year: number;
  health_score: number;
  xp: number;
  level: number;
  job_situation: string;
  monthly_salary: number;
  created_at: string;
  updated_at: string;
}

/** GET /player/profile - returns the authenticated player's profile
 * including simulation month/year, level, XP, and salary. */
export const getPlayerProfile = async (): Promise<PlayerProfile> => {
  const res = await api.get<ApiResponse<PlayerProfile>>("/player/profile");
  return res.data.data;
};
