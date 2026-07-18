export type QuestStatus = 'locked' | 'available' | 'active' | 'completed';

// Visible to the client before a choice is made — consequence and
// is_optimal are stripped by serializeChoice until the quest is completed
// and this specific choice is the one that was chosen.
export interface QuestChoiceOutput {
  id: string;
  label: string;
  description: string;
  consequence?: string;
  is_optimal?: boolean;
}

export interface QuestOutput {
  id: string;
  title: string;
  description: string;
  category: string;
  scenario_text: string;
  xp_reward: number;
  unlock_condition: string | null;
  order_index: number;
  status: QuestStatus;
  choices: QuestChoiceOutput[];
  chosen_choice_id: string | null;
  created_at: Date;
}

export interface QuestStartOutput {
  id: string;
  player_id: string;
  quest_id: string;
  status: string;
  chosen_choice_id: string | null;
  completed_at: Date | null;
  created_at: Date;
}

export interface QuestCompleteOutput {
  player_quest: QuestStartOutput;
  chosen_choice: QuestChoiceOutput;
  xp_awarded: number;
  new_xp_total: number;
  new_level: number;
  leveled_up: boolean;
}
