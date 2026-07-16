import { Request, Response, NextFunction } from 'express';
import { PortfolioService } from './portfolio.service';
import { PlayerService } from '../player/player.service';
import { MarketsService } from '../markets/markets.service';
import { successResponse } from '../../utils/response';

export class PortfolioController {
  private service: PortfolioService;

  constructor() {
    const playerService = new PlayerService(new MarketsService());
    const marketsService = new MarketsService();
    this.service = new PortfolioService(playerService, marketsService);
  }

  // Arrow functions bind `this` so the handler works when passed to router.
  // No try/catch - thrown AppErrors propagate to the global error handler via _next.
  buy = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.buy(req.user!.userId, req.body);
    const response = successResponse(result, 201);
    res.status(response.statusCode).json(response);
  };

  sell = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.sell(req.user!.userId, req.body);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  getPortfolio = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.getPortfolio(req.user!.userId);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  getTransactions = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { month, year } = req.query as { month?: string; year?: string };
    const result = await this.service.getTransactions(
      req.user!.userId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };
}
