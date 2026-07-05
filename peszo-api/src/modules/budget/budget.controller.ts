import { Request, Response, NextFunction } from 'express';
import { BudgetService } from './budget.service';

export class BudgetController {
  private service: BudgetService;

  constructor() {
    this.service = new BudgetService();
  }

  getBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getBudget(req.user!.userId);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  addIncome = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.addIncome(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  addExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.addExpense(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };
}
