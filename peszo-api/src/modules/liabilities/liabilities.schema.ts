import { z } from 'zod';

export const createLiabilitySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['credit_card', 'student_loan', 'home_loan', 'personal_loan']),
    balance: z.number().positive(),
    original_amount: z.number().positive(),
    interest_rate: z.number().positive(),
    minimum_payment: z.number().positive(),
    month_started: z.number().int().min(1).max(12),
  }),
});

export const updateLiabilitySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    balance: z.number().positive().optional(),
    minimum_payment: z.number().positive().optional(),
  }),
});

export const liabilityIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
