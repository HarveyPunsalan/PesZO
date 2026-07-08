import { Router } from 'express';
import { PlayerController } from './player.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { setupSchema, updateProfileSchema } from './player.schema';

const router = Router();
const controller = new PlayerController();

router.post('/setup', authenticate, validate(setupSchema), controller.setup);
router.get('/profile', authenticate, controller.getProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), controller.updateProfile);

export default router;
