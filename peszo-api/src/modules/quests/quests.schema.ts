import { z } from 'zod';

export const completeQuestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
