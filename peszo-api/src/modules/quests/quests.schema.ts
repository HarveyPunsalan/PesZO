import { z } from 'zod';

export const completeQuestSchema = z.object({
  body: z.object({
    choice_id: z.string().min(1),
  }),
});
