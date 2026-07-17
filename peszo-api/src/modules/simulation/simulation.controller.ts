import { Request, Response, NextFunction } from 'express';
import { SimulationService } from './simulation.service';
import { PlayerService } from '../player/player.service';
import { MarketsService } from '../markets/markets.service';
import { successResponse } from '../../utils/response';

export class SimulationController {
  private service: SimulationService;

  constructor() {
    const playerService = new PlayerService(new MarketsService());
    const marketsService = new MarketsService();
    this.service = new SimulationService(playerService, marketsService);
  }

  // Arrow functions bind `this` so the handler works when passed to router.
  // No try/catch -- thrown AppErrors propagate to the global error handler via _next.
  advance = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.advance(req.user!.userId);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  getHistory = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.getHistory(req.user!.userId);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };
}
