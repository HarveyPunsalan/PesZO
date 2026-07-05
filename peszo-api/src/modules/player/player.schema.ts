import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
  }),
});
