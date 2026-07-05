import { z } from 'zod';

export const buyAssetSchema = z.object({
  body: z.object({
    assetId: z.string().uuid(),
    quantity: z.number().positive(),
  }),
});

export const sellAssetSchema = z.object({
  body: z.object({
    assetId: z.string().uuid(),
    quantity: z.number().positive(),
  }),
});
