import { AppError } from '../../utils/response';
import { BudgetSummary, AddIncomeInput, AddExpenseInput } from './budget.types';

export class BudgetService {
  async getBudget(_userId: string): Promise<BudgetSummary> {
    // TODO: implement when Budget module is built
    // This will use prisma.income.findMany() to get all incomes
    // This will use prisma.expense.findMany() to get all expenses
    throw new AppError('Not implemented', 501);
  }

  async addIncome(_userId: string, _data: AddIncomeInput) {
    // TODO: implement when Budget module is built
    // This will use prisma.income.create() to add income
    throw new AppError('Not implemented', 501);
  }

  async addExpense(_userId: string, _data: AddExpenseInput) {
    // TODO: implement when Budget module is built
    // This will use prisma.expense.create() to add expense
    throw new AppError('Not implemented', 501);
  }
}
