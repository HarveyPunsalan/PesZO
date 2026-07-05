import { Request, Response, NextFunction } from 'express';
import { QuestsService } from './quests.service';

export class QuestsController {
  private service: QuestsService;

  constructor() {
    this.service = new QuestsService();
  }

  getQuests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getQuests(req.user!.userId);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  completeQuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.completeQuest(req.user!.userId, req.params.id as string);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };
}
