import { prisma } from '../config/database';
import { logger } from './logger';

const ASSETS = [
  {
    name: 'Cola Coca Co.',
    ticker: 'COLA',
    type: 'stock',
    current_price: 150.00,
    trend_bias: 0.003,
    volatility: 0.020,
  },
  {
    name: 'NovaTech Industries',
    ticker: 'NOVA',
    type: 'stock',
    current_price: 280.00,
    trend_bias: 0.008,
    volatility: 0.055,
  },
  {
    name: 'Meridian Foods',
    ticker: 'MERI',
    type: 'stock',
    current_price: 95.00,
    trend_bias: 0.001,
    volatility: 0.018,
  },
  {
    name: 'Sovereign Bond Fund',
    ticker: 'SBF',
    type: 'bond',
    current_price: 100.00,
    trend_bias: 0.002,
    volatility: 0.004,
  },
  {
    name: 'PesoCoin',
    ticker: 'PESO',
    type: 'crypto',
    current_price: 5000.00,
    trend_bias: 0.000,
    volatility: 0.130,
  },
  {
    name: 'Cash',
    ticker: 'CASH',
    type: 'cash',
    current_price: 1.00,
    trend_bias: 0.000,
    volatility: 0.000,
  },
];

/**
 * Seed the 6 fake assets into the database.
 * Uses upsert so it is safe to run multiple times —
 * existing assets are left untouched, only missing ones are created.
 */
export const seedAssets = async (): Promise<void> => {
  for (const asset of ASSETS) {
    await prisma.asset.upsert({
      where: { ticker: asset.ticker },
      create: asset,
      update: {},
    });
  }

  logger.info('Assets seeded', { count: ASSETS.length });
};
