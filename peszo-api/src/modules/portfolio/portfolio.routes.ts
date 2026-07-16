import { Router } from 'express';
import { PortfolioController } from './portfolio.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { buySchema, sellSchema, transactionQuerySchema } from './portfolio.schema';

const router = Router();
const controller = new PortfolioController();

router.get('/transactions', authenticate, validate(transactionQuerySchema), controller.getTransactions);
router.get('/', authenticate, controller.getPortfolio);
router.post('/buy', authenticate, validate(buySchema), controller.buy);
router.post('/sell', authenticate, validate(sellSchema), controller.sell);

export default router;
