import { Request, Response, NextFunction } from 'express';
import { PlayerService } from './player.service';
import { MarketsService } from '../markets/markets.service';
import { successResponse } from '../../utils/response';

export class PlayerController {
  private service: PlayerService;

  constructor() {
    this.service = new PlayerService(new MarketsService());
  }

  // Arrow functions bind `this` so the handler works when passed to router.
  // No try/catch — thrown AppErrors propagate to the global error handler via _next.
  setup = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.setup(req.user!.userId, req.body);
    const response = successResponse(result, 201);
    res.status(response.statusCode).json(response);
  };

  getProfile = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.getProfile(req.user!.userId);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  updateProfile = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.updateProfile(req.user!.userId, req.body);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };
}
