import { z } from 'zod';

export const tickSchema = z.object({
  body: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().positive(),
  }),
});
