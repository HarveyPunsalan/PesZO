import { Request, Response, NextFunction } from 'express';
import { PortfolioService } from './portfolio.service';

export class PortfolioController {
  private service: PortfolioService;

  constructor() {
    this.service = new PortfolioService();
  }

  getPortfolio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getPortfolio(req.user!.userId);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  buyAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.buyAsset(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  sellAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.sellAsset(req.user!.userId, req.body);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };
}
