import { Request, Response, NextFunction } from 'express';
import { PlayerService } from './player.service';

export class PlayerController {
  private service: PlayerService;

  constructor() {
    this.service = new PlayerService();
  }

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getProfile(req.user!.userId);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.updateProfile(req.user!.userId, req.body);
      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      next(error);
    }
  };
}
