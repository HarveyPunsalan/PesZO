import { Router } from 'express';
import { MarketsController } from './markets.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { tickSchema } from './markets.schema';

const router = Router();
const controller = new MarketsController();

router.get('/assets', authenticate, controller.getAllAssets);
router.get('/assets/:ticker', authenticate, controller.getAssetByTicker);
router.post('/tick', authenticate, validate(tickSchema), controller.tick);

export default router;
