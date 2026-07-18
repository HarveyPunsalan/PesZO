import { Router } from 'express';
import { QuestsController } from './quests.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { completeQuestSchema } from './quests.schema';

const router = Router();
const controller = new QuestsController();

router.get('/', authenticate, controller.getAllQuests);
router.get('/:id', authenticate, controller.getQuestById);
router.post('/:id/start', authenticate, controller.startQuest);
router.post('/:id/complete', authenticate, validate(completeQuestSchema), controller.completeQuest);

export default router;
