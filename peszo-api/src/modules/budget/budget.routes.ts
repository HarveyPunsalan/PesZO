import { Router } from 'express';
import { BudgetController } from './budget.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const controller = new BudgetController();

router.get('/', authenticate, controller.getBudget);
router.post('/income', authenticate, controller.addIncome);
router.post('/expense', authenticate, controller.addExpense);

export default router;
