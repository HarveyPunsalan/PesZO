import { Router } from 'express';
import { BudgetController } from './budget.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addIncomeSchema, addExpenseSchema, summaryQuerySchema, breakdownQuerySchema } from './budget.schema';

const router = Router();
const controller = new BudgetController();

router.post('/income', authenticate, validate(addIncomeSchema), controller.addIncome);
router.post('/expenses', authenticate, validate(addExpenseSchema), controller.addExpense);
router.get('/summary', authenticate, validate(summaryQuerySchema), controller.getSummary);
router.get('/breakdown', authenticate, validate(breakdownQuerySchema), controller.getBreakdown);

export default router;
