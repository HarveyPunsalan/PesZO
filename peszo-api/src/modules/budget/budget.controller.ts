import { Request, Response, NextFunction } from 'express';
import { BudgetService } from './budget.service';
import { PlayerService } from '../player/player.service';
import { successResponse } from '../../utils/response';

export class BudgetController {
  private service: BudgetService;

  constructor() {
    const playerService = new PlayerService();
    this.service = new BudgetService(playerService);
  }

  // Arrow functions bind `this` so the handler works when passed to router.
  // No try/catch — thrown AppErrors propagate to the global error handler via _next.
  addIncome = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.service.addIncome(req.user!.userId, req.body);
    const response = successResponse(null, 201);
    res.status(response.statusCode).json(response);
  };

  addExpense = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.service.addExpense(req.user!.userId, req.body);
    const response = successResponse(null, 201);
    res.status(response.statusCode).json(response);
  };

  getSummary = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { month, year } = req.query as { month: string; year: string };
    const result = await this.service.getSummary(req.user!.userId, Number(month), Number(year));
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  getBreakdown = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { month, year } = req.query as { month: string; year: string };
    const result = await this.service.getBreakdown(req.user!.userId, Number(month), Number(year));
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };
}
