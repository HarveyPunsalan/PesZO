import { z } from 'zod';

export const setupSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    job_situation: z.string().min(1),
    monthly_salary: z.number().positive(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    monthly_salary: z.number().positive().optional(),
  }),
});
