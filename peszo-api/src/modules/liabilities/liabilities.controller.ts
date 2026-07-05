import { Request, Response, NextFunction } from 'express';
import { LiabilitiesService } from './liabilities.service';

export class LiabilitiesController {
  private service: LiabilitiesService;

  constructor() {
    this.service = new LiabilitiesService();
  }

  getLiabilities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getLiabilities(req.user!.userId);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  addLiability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.addLiability(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  makePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.makePayment(req.params.id as string, req.body);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };
}
