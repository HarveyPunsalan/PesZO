import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";

export interface QuestChoice {
  id: string;
  label: string;
  description: string;
  consequence?: string;
  is_optimal?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  scenario_text: string;
  xp_reward: number;
  unlock_condition: string | null;
  order_index: number;
  status: "locked" | "available" | "active" | "completed";
  choices: QuestChoice[];
  chosen_choice_id: string | null;
  created_at: string;
}

/** GET /quests - returns all quests with computed status
 * (locked/available/active/completed) and per-choice visibility
 * already applied server-side; see peszo-api Quest module notes. */
export const getQuests = async (): Promise<Quest[]> => {
  const res = await api.get<ApiResponse<Quest[]>>("/quests");
  return res.data.data;
};
