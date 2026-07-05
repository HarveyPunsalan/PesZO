import { Router } from 'express';
import { MarketsController } from './markets.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new MarketsController();

router.get('/assets', authenticate, controller.getAssets);
router.get('/assets/:id', authenticate, controller.getAssetById);
router.get('/history', authenticate, controller.getMarketHistory);

export default router;
