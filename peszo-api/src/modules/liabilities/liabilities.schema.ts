import { z } from 'zod';

export const addLiabilitySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['loan', 'credit_card', 'mortgage', 'other']),
    totalAmount: z.number().positive(),
    interestRate: z.number().min(0).max(100),
    minimumPayment: z.number().positive(),
  }),
});

export const makePaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
  }),
});
