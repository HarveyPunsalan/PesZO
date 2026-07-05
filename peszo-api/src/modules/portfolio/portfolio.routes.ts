import { Router } from 'express';
import { PortfolioController } from './portfolio.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new PortfolioController();

router.get('/', authenticate, controller.getPortfolio);
router.post('/buy', authenticate, controller.buyAsset);
router.post('/sell', authenticate, controller.sellAsset);

export default router;
