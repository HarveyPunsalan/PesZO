import { z } from 'zod';

export const addIncomeSchema = z.object({
  body: z.object({
    source: z.string().min(1),
    amount: z.number().positive(),
    frequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']),
  }),
});

export const addExpenseSchema = z.object({
  body: z.object({
    category: z.string().min(1),
    amount: z.number().positive(),
    frequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']),
  }),
});
