import { Router } from 'express';
import { SimulationController } from './simulation.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new SimulationController();

router.post('/advance', authenticate, controller.advance);
router.get('/history', authenticate, controller.getHistory);

export default router;
