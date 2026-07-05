import { z } from 'zod';

export const getAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getMarketHistorySchema = z.object({
  query: z.object({
    assetId: z.string().uuid(),
  }),
});
