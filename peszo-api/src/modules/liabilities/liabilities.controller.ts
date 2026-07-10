import { Request, Response, NextFunction } from 'express';
import { LiabilitiesService } from './liabilities.service';
import { PlayerService } from '../player/player.service';
import { successResponse } from '../../utils/response';

export class LiabilitiesController {
  private service: LiabilitiesService;

  constructor() {
    const playerService = new PlayerService();
    this.service = new LiabilitiesService(playerService);
  }

  // Arrow functions bind `this` so the handler works when passed to router.
  // No try/catch — thrown AppErrors propagate to the global error handler via _next.
  create = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.create(req.user!.userId, req.body);
    const response = successResponse(result, 201);
    res.status(response.statusCode).json(response);
  };

  getAll = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.getAll(req.user!.userId);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  update = async (req: Request<{ id: string }>, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.update(req.user!.userId, req.params.id, req.body);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  remove = async (req: Request<{ id: string }>, res: Response, _next: NextFunction): Promise<void> => {
    await this.service.delete(req.user!.userId, req.params.id);
    const response = successResponse(null);
    res.status(response.statusCode).json(response);
  };
}
