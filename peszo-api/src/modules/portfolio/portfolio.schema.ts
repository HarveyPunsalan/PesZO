import { z } from 'zod';

export const buySchema = z.object({
  body: z.object({
    ticker: z.string().min(1),
    quantity: z.number().positive().finite(),
  }),
});

export const sellSchema = z.object({
  body: z.object({
    ticker: z.string().min(1),
    quantity: z.number().positive().finite(),
  }),
});

export const transactionQuerySchema = z.object({
  query: z.object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().optional(),
  }),
});
