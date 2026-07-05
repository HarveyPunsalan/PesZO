import { Router } from 'express';
import { SimulationController } from './simulation.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new SimulationController();

router.post('/advance-month', authenticate, controller.advanceMonth);
router.get('/state', authenticate, controller.getSimulationState);

export default router;
