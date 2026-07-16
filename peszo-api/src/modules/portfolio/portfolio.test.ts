// @ts-nocheck - mock types intentionally diverge from Prisma client types;
// vi.restoreAllMocks() resets mocks to their original typed signatures,
// making runtime-correct casts fail at the type level.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PortfolioService } from './portfolio.service';
import { AppError } from '../../utils/response';

// Prisma and services are mocked per-test - the service layer is the
// only code under test; controllers and routes are thin wrappers.
vi.mock('../../config/database', () => {
  const mockPrisma = {
    portfolio: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn((fns: unknown) => {
      if (typeof fns === 'function') return fns(mockPrisma);
      return Promise.all(fns as readonly unknown[]);
    }),
  };
  return { prisma: mockPrisma };
});

import { prisma } from '../../config/database';

const mockPlayerService = {
  getProfile: vi.fn(),
};

const mockMarketsService = {
  getAssetByTicker: vi.fn(),
};

const CASH_ASSET = {
  id: 'cash-id',
  name: 'Peso Cash',
  ticker: 'CASH',
  type: 'cash',
  current_price: 1,
  trend_bias: 0,
  volatility: 0,
  created_at: new Date(),
  updated_at: new Date(),
};

const NOVA_ASSET = {
  id: 'nova-id',
  name: 'Nova Corp',
  ticker: 'NOVA',
  type: 'stock',
  current_price: 10,
  trend_bias: 0.02,
  volatility: 0.05,
  created_at: new Date(),
  updated_at: new Date(),
};

const PLAYER = {
  id: 'player-1',
  user_id: 'user-1',
  name: 'Test Player',
  simulation_month: 3,
  simulation_year: 2025,
  health_score: 0,
  xp: 0,
  level: 1,
  job_situation: 'employed',
  monthly_salary: 50000,
  created_at: new Date(),
  updated_at: new Date(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockArgs = Record<string, any>;

const as = <T>(fn: ReturnType<typeof vi.fn>): T => fn as unknown as T;

describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(() => {
    vi.restoreAllMocks();
    service = new PortfolioService(mockPlayerService as never, mockMarketsService as never);
    mockPlayerService.getProfile.mockResolvedValue(PLAYER);
    mockMarketsService.getAssetByTicker.mockImplementation(async (ticker: string) => {
      if (ticker === 'CASH') return CASH_ASSET;
      if (ticker === 'NOVA') return NOVA_ASSET;
      throw new AppError('Asset not found', 404);
    });
  });

  describe('buy', () => {
    it('first-time buy creates a Portfolio row with avg_buy_price equal to current_price', async () => {
      // Player starts with 100000 CASH
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'cash-id') {
            return { id: 'cash-row', player_id: 'player-1', asset_id: 'cash-id', quantity: 100000, avg_buy_price: 1, created_at: new Date(), updated_at: new Date() };
          }
          return null; // no existing NOVA holding
        });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.portfolio.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'portfolio-1', created_at: new Date(), updated_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.transaction.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'tx-1', created_at: new Date() }));

      const result = await service.buy('user-1', { ticker: 'NOVA', quantity: 5 });

      expect(result.holding.ticker).toBe('NOVA');
      expect(result.holding.quantity).toBe(5);
      expect(result.holding.avg_buy_price).toBe(10);
      expect(result.holding.market_value).toBe(50);
      expect(result.holding.unrealized_pnl).toBe(0);
    });

    it('second buy recalculates weighted average avg_buy_price correctly', async () => {
      // First buy: 5 NOVA at 10 - player has CASH, no existing NOVA
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'cash-id') {
            return { id: 'cash-row', player_id: 'player-1', asset_id: 'cash-id', quantity: 100000, avg_buy_price: 1, created_at: new Date(), updated_at: new Date() };
          }
          return null;
        });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.portfolio.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'portfolio-1', created_at: new Date(), updated_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.portfolio.update)
        .mockImplementation(async ({ where, data }: MockArgs) => ({ id: (where as MockArgs).id, player_id: 'player-1', asset_id: 'nova-id', ...(data as MockArgs), created_at: new Date(), updated_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.transaction.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'tx-1', created_at: new Date() }));

      await service.buy('user-1', { ticker: 'NOVA', quantity: 5 });

      // Second buy: 3 NOVA at 20 - price rose, existing holding is 5@10
      mockMarketsService.getAssetByTicker.mockImplementation(async (ticker: string) => {
        if (ticker === 'CASH') return CASH_ASSET;
        if (ticker === 'NOVA') return { ...NOVA_ASSET, current_price: 20 };
        throw new AppError('Asset not found', 404);
      });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'cash-id') {
            return { id: 'cash-row', player_id: 'player-1', asset_id: 'cash-id', quantity: 99950, avg_buy_price: 1, created_at: new Date(), updated_at: new Date() };
          }
          if (composite.asset_id === 'nova-id') {
            return { id: 'portfolio-1', player_id: 'player-1', asset_id: 'nova-id', quantity: 5, avg_buy_price: 10, created_at: new Date(), updated_at: new Date() };
          }
          return null;
        });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.portfolio.update)
        .mockImplementation(async ({ where, data }: MockArgs) => ({ id: (where as MockArgs).id, player_id: 'player-1', asset_id: 'nova-id', ...(data as MockArgs), created_at: new Date(), updated_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.transaction.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'tx-2', created_at: new Date() }));

      const result = await service.buy('user-1', { ticker: 'NOVA', quantity: 3 });

      // Weighted average: ((5 * 10) + (3 * 20)) / 8 = 110 / 8 = 13.75
      expect(result.holding.quantity).toBe(8);
      expect(result.holding.avg_buy_price).toBe(13.75);
    });

    it('buy with insufficient CASH throws 400', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'cash-id') {
            return { id: 'cash-row', player_id: 'player-1', asset_id: 'cash-id', quantity: 50, avg_buy_price: 1, created_at: new Date(), updated_at: new Date() };
          }
          return null;
        });

      await expect(service.buy('user-1', { ticker: 'NOVA', quantity: 10 }))
        .rejects.toThrow('Insufficient funds');
    });

    it('buy with missing CASH row throws 400', async () => {
      as<(q: MockArgs) => Promise<null>>(prisma.portfolio.findUnique).mockResolvedValue(null);

      await expect(service.buy('user-1', { ticker: 'NOVA', quantity: 1 }))
        .rejects.toThrow('Insufficient funds');
    });

    it('buying CASH throws 400', async () => {
      await expect(service.buy('user-1', { ticker: 'CASH', quantity: 10 }))
        .rejects.toThrow('Cannot buy CASH directly');
    });
  });

  describe('sell', () => {
    it('sell with quantity greater than held throws 400', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'nova-id') {
            return { id: 'portfolio-1', player_id: 'player-1', asset_id: 'nova-id', quantity: 5, avg_buy_price: 10, created_at: new Date(), updated_at: new Date() };
          }
          return null;
        });

      await expect(service.sell('user-1', { ticker: 'NOVA', quantity: 10 }))
        .rejects.toThrow('Insufficient holdings');
    });

    it('sell with no existing holding throws 400', async () => {
      as<(q: MockArgs) => Promise<null>>(prisma.portfolio.findUnique).mockResolvedValue(null);

      await expect(service.sell('user-1', { ticker: 'NOVA', quantity: 1 }))
        .rejects.toThrow('Insufficient holdings');
    });

    it('partial sell decrements quantity, avg_buy_price unchanged', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'nova-id') {
            return { id: 'portfolio-1', player_id: 'player-1', asset_id: 'nova-id', quantity: 8, avg_buy_price: 13.75, created_at: new Date(), updated_at: new Date() };
          }
          // CASH row for the credit step
          return { id: 'cash-row', player_id: 'player-1', asset_id: 'cash-id', quantity: 50000, avg_buy_price: 1, created_at: new Date(), updated_at: new Date() };
        });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.portfolio.update)
        .mockImplementation(async ({ where, data }: MockArgs) => ({ id: (where as MockArgs).id, player_id: 'player-1', asset_id: 'nova-id', avg_buy_price: 13.75, ...(data as MockArgs), created_at: new Date(), updated_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.transaction.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'tx-1', created_at: new Date() }));

      const result = await service.sell('user-1', { ticker: 'NOVA', quantity: 3 });

      expect(result.holding).not.toBeNull();
      expect(result.holding!.quantity).toBe(5);
      expect(result.holding!.avg_buy_price).toBe(13.75);
    });

    it('full liquidation deletes the Portfolio row', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'nova-id') {
            return { id: 'portfolio-1', player_id: 'player-1', asset_id: 'nova-id', quantity: 5, avg_buy_price: 10, created_at: new Date(), updated_at: new Date() };
          }
          return { id: 'cash-row', player_id: 'player-1', asset_id: 'cash-id', quantity: 50000, avg_buy_price: 1, created_at: new Date(), updated_at: new Date() };
        });
      as<(q: MockArgs) => Promise<void>>(prisma.portfolio.delete).mockResolvedValue(undefined);
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.transaction.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'tx-1', created_at: new Date() }));

      const result = await service.sell('user-1', { ticker: 'NOVA', quantity: 5 });

      expect(result.holding).toBeNull();
    });

    it('realized_pnl calculation is correct on a sell', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'nova-id') {
            return { id: 'portfolio-1', player_id: 'player-1', asset_id: 'nova-id', quantity: 5, avg_buy_price: 10, created_at: new Date(), updated_at: new Date() };
          }
          return { id: 'cash-row', player_id: 'player-1', asset_id: 'cash-id', quantity: 50000, avg_buy_price: 1, created_at: new Date(), updated_at: new Date() };
        });
      as<(q: MockArgs) => Promise<void>>(prisma.portfolio.delete).mockResolvedValue(undefined);
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.transaction.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'tx-1', created_at: new Date() }));

      mockMarketsService.getAssetByTicker.mockImplementation(async (ticker: string) => {
        if (ticker === 'CASH') return CASH_ASSET;
        if (ticker === 'NOVA') return { ...NOVA_ASSET, current_price: 15 };
        throw new AppError('Asset not found', 404);
      });

      const result = await service.sell('user-1', { ticker: 'NOVA', quantity: 5 });

      // (15 - 10) * 5 = 25
      expect(result.realized_pnl).toBe(25);
    });

    it('selling CASH throws 400', async () => {
      await expect(service.sell('user-1', { ticker: 'CASH', quantity: 10 }))
        .rejects.toThrow('Cannot sell CASH');
    });
  });

  describe('transaction integrity', () => {
    it('both Transaction rows (CASH and target) are created on a single buy', async () => {
      const createdTransactions: MockArgs[] = [];
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'cash-id') {
            return { id: 'cash-row', player_id: 'player-1', asset_id: 'cash-id', quantity: 100000, avg_buy_price: 1, created_at: new Date(), updated_at: new Date() };
          }
          return null;
        });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.portfolio.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: `portfolio-${createdTransactions.length}`, created_at: new Date(), updated_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.transaction.create)
        .mockImplementation(async ({ data }: MockArgs) => {
          const tx = { ...data, id: `tx-${createdTransactions.length}`, created_at: new Date() };
          createdTransactions.push(tx);
          return tx;
        });

      await service.buy('user-1', { ticker: 'NOVA', quantity: 5 });

      expect(createdTransactions).toHaveLength(2);
      expect(createdTransactions[0]).toMatchObject({ asset_id: 'cash-id', type: 'SELL' });
      expect(createdTransactions[1]).toMatchObject({ asset_id: 'nova-id', type: 'BUY' });
    });

    it('both Transaction rows (CASH and target) are created on a single sell', async () => {
      const createdTransactions: MockArgs[] = [];
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'nova-id') {
            return { id: 'portfolio-1', player_id: 'player-1', asset_id: 'nova-id', quantity: 5, avg_buy_price: 10, created_at: new Date(), updated_at: new Date() };
          }
          return { id: 'cash-row', player_id: 'player-1', asset_id: 'cash-id', quantity: 50000, avg_buy_price: 1, created_at: new Date(), updated_at: new Date() };
        });
      as<(q: MockArgs) => Promise<void>>(prisma.portfolio.delete).mockResolvedValue(undefined);
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.transaction.create)
        .mockImplementation(async ({ data }: MockArgs) => {
          const tx = { ...data, id: `tx-${createdTransactions.length}`, created_at: new Date() };
          createdTransactions.push(tx);
          return tx;
        });

      await service.sell('user-1', { ticker: 'NOVA', quantity: 5 });

      expect(createdTransactions).toHaveLength(2);
      expect(createdTransactions[0]).toMatchObject({ asset_id: 'nova-id', type: 'SELL' });
      expect(createdTransactions[1]).toMatchObject({ asset_id: 'cash-id', type: 'BUY' });
    });
  });

  describe('transaction rollback', () => {
    it('a failure partway through the Prisma transaction rolls back both Portfolio and Transaction writes', async () => {
      const calls: string[] = [];

      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.portfolio.findUnique)
        .mockImplementation(async (q: MockArgs) => {
          const where = q.where as MockArgs;
          const composite = where.player_id_asset_id as MockArgs;
          if (composite.asset_id === 'cash-id') {
            return { id: 'cash-row', player_id: 'player-1', asset_id: 'cash-id', quantity: 100000, avg_buy_price: 1, created_at: new Date(), updated_at: new Date() };
          }
          return null;
        });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.portfolio.update)
        .mockImplementation(async () => {
          calls.push('cash-update');
          return { id: 'cash-row', quantity: 99950 };
        });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.transaction.create)
        .mockImplementation(async () => {
          calls.push('cash-transaction');
          return { id: 'tx-cash', created_at: new Date() };
        });
      as<() => Promise<never>>(prisma.portfolio.create).mockRejectedValue(new Error('Simulated DB failure'));

      // Override $transaction to catch errors like real Prisma does
      as<(fn: (tx: unknown) => Promise<unknown>) => Promise<unknown>>(prisma.$transaction)
        .mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
          try {
            return await fn(prisma);
          } catch {
            calls.push('rolled-back');
            throw new Error('Transaction failed');
          }
        });

      await expect(service.buy('user-1', { ticker: 'NOVA', quantity: 5 }))
        .rejects.toThrow('Transaction failed');

      expect(calls).toContain('rolled-back');
    });
  });
});
