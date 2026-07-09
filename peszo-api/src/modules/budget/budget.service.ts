import { prisma } from '../../config/database';
import { AppError } from '../../utils/response';
import { createLogger } from '../../lib/logger';
import { PlayerService } from '../player/player.service';
import { AddIncomeInput, AddExpenseInput, BudgetSummaryOutput, BudgetBreakdownOutput } from './budget.types';

const logger = createLogger('budget-service');

export class BudgetService {
  private playerService: PlayerService;

  constructor(playerService: PlayerService) {
    this.playerService = playerService;
  }

  /** Record an income entry for the current simulation month. */
  async addIncome(userId: string, data: AddIncomeInput): Promise<void> {
    const player = await this.playerService.getProfile(userId);

    await prisma.budget.create({
      data: {
        player_id: player.id,
        category: data.category,
        type: 'income',
        amount: data.amount,
        month: data.month,
        year: data.year,
      },
    });

    logger.info('Income recorded', { playerId: player.id, category: data.category, amount: data.amount });
  }

  /** Record an expense entry for the current simulation month. */
  async addExpense(userId: string, data: AddExpenseInput): Promise<void> {
    const player = await this.playerService.getProfile(userId);

    await prisma.budget.create({
      data: {
        player_id: player.id,
        category: data.category,
        type: 'expense',
        amount: data.amount,
        month: data.month,
        year: data.year,
      },
    });

    logger.info('Expense recorded', { playerId: player.id, category: data.category, amount: data.amount });
  }

  /**
   * Summarize income vs expenses for a given month.
   * savings_rate is 0 when total_income is 0 to avoid
   * division by zero — no meaningful rate exists with no income.
   */
  async getSummary(userId: string, month: number, year: number): Promise<BudgetSummaryOutput> {
    const player = await this.playerService.getProfile(userId);

    const budgets = await prisma.budget.findMany({
      where: { player_id: player.id, month, year },
    });

    const total_income = budgets
      .filter((b) => b.type === 'income')
      .reduce((sum, b) => sum + b.amount, 0);

    const total_expenses = budgets
      .filter((b) => b.type === 'expense')
      .reduce((sum, b) => sum + b.amount, 0);

    const net_cash_flow = total_income - total_expenses;
    const savings_rate = total_income === 0 ? 0 : Math.round(((total_income - total_expenses) / total_income) * 100 * 10) / 10;

    return { total_income, total_expenses, net_cash_flow, savings_rate };
  }

  /** Break down all budget entries by category for a given month, sorted by amount descending. */
  async getBreakdown(userId: string, month: number, year: number): Promise<BudgetBreakdownOutput[]> {
    const player = await this.playerService.getProfile(userId);

    const budgets = await prisma.budget.findMany({
      where: { player_id: player.id, month, year, type: 'expense' },
    });

    // Aggregate amounts by category — expenses only
    const categoryMap = new Map<string, number>();
    for (const b of budgets) {
      categoryMap.set(b.category, (categoryMap.get(b.category) ?? 0) + b.amount);
    }

    const totalAmount = budgets.reduce((sum, b) => sum + b.amount, 0);

    const breakdown: BudgetBreakdownOutput[] = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalAmount === 0 ? 0 : Math.round((amount / totalAmount) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.amount - a.amount);

    return breakdown;
  }
}
