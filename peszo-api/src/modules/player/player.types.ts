export interface PlayerSetupInput {
  name: string;
  job_situation: string;
  monthly_salary: number;
}

export interface PlayerUpdateInput {
  name?: string;
  monthly_salary?: number;
}

export interface PlayerProfileOutput {
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
  created_at: Date;
  updated_at: Date;
}
