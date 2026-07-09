import { z } from 'zod';

const monthField = z.coerce.number().int().min(1).max(12);
const yearField = z.coerce.number().int().positive();

export const addIncomeSchema = z.object({
  body: z.object({
    type: z.literal('income'),
    category: z.enum(['salary', 'freelance', 'business', 'other']),
    amount: z.number().positive(),
    month: monthField,
    year: yearField,
  }),
});

export const addExpenseSchema = z.object({
  body: z.object({
    type: z.literal('expense'),
    category: z.enum(['housing', 'food', 'transport', 'utilities', 'entertainment', 'health', 'others']),
    amount: z.number().positive(),
    month: monthField,
    year: yearField,
  }),
});

export const summaryQuerySchema = z.object({
  query: z.object({
    month: monthField,
    year: yearField,
  }),
});

export const breakdownQuerySchema = z.object({
  query: z.object({
    month: monthField,
    year: yearField,
  }),
});
