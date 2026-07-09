export interface AddIncomeInput {
  type: 'income';
  category: string;
  amount: number;
  month: number;
  year: number;
}

export interface AddExpenseInput {
  type: 'expense';
  category: string;
  amount: number;
  month: number;
  year: number;
}

export interface BudgetSummaryOutput {
  total_income: number;
  total_expenses: number;
  net_cash_flow: number;
  savings_rate: number;
}

export interface BudgetBreakdownOutput {
  category: string;
  amount: number;
  percentage: number;
}
