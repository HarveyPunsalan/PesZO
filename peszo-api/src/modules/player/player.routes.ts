import { Router } from 'express';
import { PlayerController } from './player.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new PlayerController();

router.get('/me', authenticate, controller.getProfile);
router.put('/me', authenticate, controller.updateProfile);

export default router;
