import { Request, Response, NextFunction } from 'express';
import { SimulationService } from './simulation.service';

export class SimulationController {
  private service: SimulationService;

  constructor() {
    this.service = new SimulationService();
  }

  advanceMonth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.advanceMonth(req.user!.userId);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  getSimulationState = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getSimulationState(req.user!.userId);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };
}
