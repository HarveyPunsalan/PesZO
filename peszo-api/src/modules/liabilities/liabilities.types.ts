export interface CreateLiabilityInput {
  name: string;
  type: 'credit_card' | 'student_loan' | 'home_loan' | 'personal_loan';
  balance: number;
  original_amount: number;
  interest_rate: number;
  minimum_payment: number;
  month_started: number;
}

export interface UpdateLiabilityInput {
  balance?: number;
  minimum_payment?: number;
}

export interface LiabilityOutput {
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
  created_at: Date;
  updated_at: Date;
}
