import { prisma } from '../../config/database';
import { AppError } from '../../utils/response';
import { createLogger } from '../../lib/logger';
import { AssetOutput, AssetWithHistory, AssetTickInput } from './markets.types';

const logger = createLogger('markets-service');

/**
 * Box-Muller transform converts two uniform random numbers into one
 * normally distributed sample. No external library needed for this.
 */
const gaussianRandom = (mean: number, stdDev: number): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
};

export class MarketsService {
  /** Fetch all assets ordered by name for display in the portfolio UI. */
  async getAllAssets(): Promise<AssetOutput[]> {
    const assets = await prisma.asset.findMany({
      orderBy: { name: 'asc' },
    });

    return assets;
  }

  /**
   * Fetch a single asset by ticker with full price history.
   * History is ordered chronologically so the client can render
   * a time-series chart without additional sorting.
   */
  async getAssetByTicker(ticker: string): Promise<AssetWithHistory> {
    const asset = await prisma.asset.findUnique({
      where: { ticker },
      include: {
        price_history: {
          orderBy: [{ year: 'asc' }, { month: 'asc' }],
        },
      },
    });

    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    return asset;
  }

  /**
   * Advance all asset prices forward by one simulation month.
   * Uses geometric random walk: newPrice = price * (1 + trend + shock).
   * Price is floored at 1.00 to prevent assets from going to zero
   * or negative, which would break portfolio calculations downstream.
   */
  async tickAllAssets(data: AssetTickInput): Promise<AssetOutput[]> {
    const assets = await prisma.asset.findMany();

    const updates = assets.map(async (asset) => {
      const randomShock = gaussianRandom(0, asset.volatility);
      const monthlyReturn = asset.trend_bias + randomShock;
      const newPrice = Math.max(1.00, Math.round(asset.current_price * (1 + monthlyReturn) * 100) / 100);

      // Wrap both writes in a transaction so a partial failure doesn't
      // leave an asset updated without a corresponding history row.
      await prisma.$transaction([
        prisma.asset.update({
          where: { id: asset.id },
          data: { current_price: newPrice },
        }),
        prisma.assetPriceHistory.create({
          data: {
            asset_id: asset.id,
            price: newPrice,
            month: data.month,
            year: data.year,
          },
        }),
      ]);

      return { ...asset, current_price: newPrice };
    });

    const updatedAssets = await Promise.all(updates);

    logger.info('Assets ticked', { month: data.month, year: data.year, count: updatedAssets.length });

    return updatedAssets;
  }
}
