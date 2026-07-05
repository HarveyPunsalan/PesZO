export interface AddIncomeInput {
  source: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
}

export interface AddExpenseInput {
  category: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
}

export interface BudgetSummary {
  incomes: any[];
  expenses: any[];
  totalIncome: number;
  totalExpenses: number;
  net: number;
}
