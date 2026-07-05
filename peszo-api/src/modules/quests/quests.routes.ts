import { Router } from 'express';
import { QuestsController } from './quests.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new QuestsController();

router.get('/', authenticate, controller.getQuests);
router.post('/:id/complete', authenticate, controller.completeQuest);

export default router;
