import { Router } from 'express';
import { LiabilitiesController } from './liabilities.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new LiabilitiesController();

router.get('/', authenticate, controller.getLiabilities);
router.post('/', authenticate, controller.addLiability);
router.post('/:id/payment', authenticate, controller.makePayment);

export default router;
