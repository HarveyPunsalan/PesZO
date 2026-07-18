import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response';
import { QuestService } from './quests.service';
import { PlayerService } from '../player/player.service';
import { MarketsService } from '../markets/markets.service';

export class QuestsController {
  private service: QuestService;

  constructor() {
    const playerService = new PlayerService(new MarketsService());
    this.service = new QuestService(playerService);
  }

  // Arrow functions bind `this` so the handler works when passed to router.
  // No try/catch — thrown AppErrors propagate to the global error handler via _next.
  getAllQuests = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.getAllQuests(req.user!.userId);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  getQuestById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.getQuestById(req.user!.userId, req.params.id as string);
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };

  startQuest = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.startQuest(req.user!.userId, req.params.id as string);
    const response = successResponse(result, 201);
    res.status(response.statusCode).json(response);
  };

  completeQuest = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.completeQuest(
      req.user!.userId,
      req.params.id as string,
      req.body.choice_id,
    );
    const response = successResponse(result);
    res.status(response.statusCode).json(response);
  };
}
