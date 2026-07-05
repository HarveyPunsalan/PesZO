import { Request, Response, NextFunction } from 'express';
import { MarketsService } from './markets.service';

export class MarketsController {
  private service: MarketsService;

  constructor() {
    this.service = new MarketsService();
  }

  getAssets = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAssets();
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  getAssetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAssetById(req.params.id as string);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  getMarketHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getMarketHistory(req.query as any);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };
}
