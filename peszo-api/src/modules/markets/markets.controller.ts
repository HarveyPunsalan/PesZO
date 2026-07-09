import { Request, Response, NextFunction } from 'express';
import { MarketsService } from './markets.service';
import { successResponse } from '../../utils/response';

export class MarketsController {
  private service: MarketsService;

  constructor() {
    this.service = new MarketsService();
  }

  // Arrow functions bind `this` so the handler works when passed to router.
  // No try/catch — thrown AppErrors propagate to the global error handler via _next.
  getAllAssets = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.getAllAssets();
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  getAssetByTicker = async (req: Request<{ ticker: string }>, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.getAssetByTicker(req.params.ticker);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  tick = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.tickAllAssets(req.body);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };
}
