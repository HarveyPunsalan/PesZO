import { Router } from 'express';
import { LiabilitiesController } from './liabilities.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createLiabilitySchema, updateLiabilitySchema, liabilityIdParamSchema } from './liabilities.schema';

const router = Router();
const controller = new LiabilitiesController();

router.post('/', authenticate, validate(createLiabilitySchema), controller.create);
router.get('/', authenticate, controller.getAll);
router.patch('/:id', authenticate, validate(updateLiabilitySchema), controller.update);
router.delete('/:id', authenticate, validate(liabilityIdParamSchema), controller.remove);

export default router;
