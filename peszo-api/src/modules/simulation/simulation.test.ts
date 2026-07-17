// @ts-nocheck - mock types intentionally diverge from Prisma client types;
// vi.restoreAllMocks() resets mocks to their original typed signatures,
// making runtime-correct casts fail at the type level.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimulationService } from './simulation.service';
import { clamp } from '../../utils/random';

// Prisma and services are mocked per-test - the service layer is the
// only code under test; controllers and routes are thin wrappers.
vi.mock('../../config/database', () => {
  const mockPrisma = {
    simulation: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    player: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((fn: unknown) => {
      if (typeof fn === 'function') return fn(mockPrisma);
      return Promise.all(fn as readonly unknown[]);
    }),
  };
  return { prisma: mockPrisma };
});

import { prisma } from '../../config/database';

const mockPlayerService = {
  getProfile: vi.fn(),
};

const mockMarketsService = {
  tickAllAssets: vi.fn(),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockArgs = Record<string, any>;

const as = <T>(fn: ReturnType<typeof vi.fn>): T => fn as unknown as T;

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

const STARTING_INDICATORS = {
  inflation_rate: 0.042,
  interest_rate: 0.065,
  gdp_growth: 0.058,
  unemployment_rate: 0.041,
  exchange_rate: 56.40,
  market_index: 6842,
};

describe('SimulationService', () => {
  let service: SimulationService;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    service = new SimulationService(mockPlayerService as never, mockMarketsService as never);
    mockPlayerService.getProfile.mockResolvedValue(PLAYER);
    mockMarketsService.tickAllAssets.mockResolvedValue([]);
  });

  describe('advance', () => {
    it('first advance creates a row with fixed starting values at the player current month/year', async () => {
      // No previous simulation row exists
      as<(q: MockArgs) => Promise<null>>(prisma.simulation.findFirst).mockResolvedValue(null);
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.simulation.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'sim-1', created_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...PLAYER, ...data }));

      const result = await service.advance('user-1');

      expect(result.month).toBe(3);
      expect(result.year).toBe(2025);
      expect(result.inflation_rate).toBe(STARTING_INDICATORS.inflation_rate);
      expect(result.interest_rate).toBe(STARTING_INDICATORS.interest_rate);
      expect(result.gdp_growth).toBe(STARTING_INDICATORS.gdp_growth);
      expect(result.unemployment_rate).toBe(STARTING_INDICATORS.unemployment_rate);
      expect(result.exchange_rate).toBe(STARTING_INDICATORS.exchange_rate);
      expect(result.market_index).toBe(STARTING_INDICATORS.market_index);
    });

    it('first advance updates the player to the next month', async () => {
      as<(q: MockArgs) => Promise<null>>(prisma.simulation.findFirst).mockResolvedValue(null);
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.simulation.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'sim-1', created_at: new Date() }));

      let updatedMonth: number | undefined;
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => {
          updatedMonth = data.simulation_month;
          return { ...PLAYER, ...data };
        });

      await service.advance('user-1');

      // Player was at month 3, so next is month 4
      expect(updatedMonth).toBe(4);
    });

    it('second advance generates values via random walk from the previous row', async () => {
      const previousRow = {
        id: 'sim-1',
        player_id: 'player-1',
        month: 3,
        year: 2025,
        inflation_rate: 0.042,
        interest_rate: 0.065,
        gdp_growth: 0.058,
        unemployment_rate: 0.041,
        exchange_rate: 56.40,
        market_index: 6842,
        created_at: new Date(),
      };

      as<(q: MockArgs) => Promise<MockArgs>>(prisma.simulation.findFirst).mockResolvedValue(previousRow);
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.simulation.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'sim-2', created_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...PLAYER, ...data }));

      const result = await service.advance('user-1');

      // Row is created for the NEXT month (4), not the previous row month (3)
      expect(result.month).toBe(4);
      expect(result.year).toBe(2025);
      // The values are not the fixed starting values -- they are random walk from previous
      expect(result.inflation_rate).not.toBe(STARTING_INDICATORS.inflation_rate);
      expect(result.interest_rate).not.toBe(STARTING_INDICATORS.interest_rate);
    });

    it('month rollover: previous row at month 12 produces a new row at month 1 with year incremented', async () => {
      const previousRow = {
        id: 'sim-1',
        player_id: 'player-1',
        month: 12,
        year: 2025,
        inflation_rate: 0.042,
        interest_rate: 0.065,
        gdp_growth: 0.058,
        unemployment_rate: 0.041,
        exchange_rate: 56.40,
        market_index: 6842,
        created_at: new Date(),
      };

      as<(q: MockArgs) => Promise<MockArgs>>(prisma.simulation.findFirst).mockResolvedValue(previousRow);
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.simulation.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'sim-2', created_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...PLAYER, ...data }));

      const result = await service.advance('user-1');

      expect(result.month).toBe(1);
      expect(result.year).toBe(2026);
    });

    it('all six indicators stay within clamped ranges across 100 repeated advances', async () => {
      const bounds = {
        inflation_rate:    { min: 0.01, max: 0.15 },
        interest_rate:     { min: 0.01, max: 0.20 },
        gdp_growth:        { min: -0.05, max: 0.10 },
        unemployment_rate: { min: 0.02, max: 0.15 },
        exchange_rate:     { min: 45, max: 75 },
        market_index:      { min: 4000, max: 12000 },
      };

      let currentMonth = 1;
      let currentYear = 2025;
      let previousIndicators = STARTING_INDICATORS;

      as<(q: MockArgs) => Promise<MockArgs>>(prisma.simulation.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'sim-x', created_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => {
          currentMonth = data.simulation_month;
          currentYear = data.simulation_year;
          return { ...PLAYER, simulation_month: currentMonth, simulation_year: currentYear };
        });

      for (let i = 0; i < 150; i++) {
        // Set up the previous row for this iteration
        as<(q: MockArgs) => Promise<MockArgs>>(prisma.simulation.findFirst).mockResolvedValue({
          id: `sim-${i}`,
          player_id: 'player-1',
          month: currentMonth,
          year: currentYear,
          ...previousIndicators,
          created_at: new Date(),
        });

        const result = await service.advance('user-1');

        // Assert every indicator is within bounds
        expect(result.inflation_rate).toBeGreaterThanOrEqual(bounds.inflation_rate.min);
        expect(result.inflation_rate).toBeLessThanOrEqual(bounds.inflation_rate.max);
        expect(result.interest_rate).toBeGreaterThanOrEqual(bounds.interest_rate.min);
        expect(result.interest_rate).toBeLessThanOrEqual(bounds.interest_rate.max);
        expect(result.gdp_growth).toBeGreaterThanOrEqual(bounds.gdp_growth.min);
        expect(result.gdp_growth).toBeLessThanOrEqual(bounds.gdp_growth.max);
        expect(result.unemployment_rate).toBeGreaterThanOrEqual(bounds.unemployment_rate.min);
        expect(result.unemployment_rate).toBeLessThanOrEqual(bounds.unemployment_rate.max);
        expect(result.exchange_rate).toBeGreaterThanOrEqual(bounds.exchange_rate.min);
        expect(result.exchange_rate).toBeLessThanOrEqual(bounds.exchange_rate.max);
        expect(result.market_index).toBeGreaterThanOrEqual(bounds.market_index.min);
        expect(result.market_index).toBeLessThanOrEqual(bounds.market_index.max);

        // Feed this result as the previous row for the next iteration
        previousIndicators = {
          inflation_rate: result.inflation_rate,
          interest_rate: result.interest_rate,
          gdp_growth: result.gdp_growth,
          unemployment_rate: result.unemployment_rate,
          exchange_rate: result.exchange_rate,
          market_index: result.market_index,
        };
      }
    });
  });

  describe('getHistory', () => {
    it('returns rows ordered by year ascending then month ascending', async () => {
      const rows = [
        { id: 'sim-1', player_id: 'player-1', month: 1, year: 2025, inflation_rate: 0.042, interest_rate: 0.065, gdp_growth: 0.058, unemployment_rate: 0.041, exchange_rate: 56.40, market_index: 6842, created_at: new Date() },
        { id: 'sim-2', player_id: 'player-1', month: 2, year: 2025, inflation_rate: 0.043, interest_rate: 0.066, gdp_growth: 0.059, unemployment_rate: 0.040, exchange_rate: 56.50, market_index: 6900, created_at: new Date() },
        { id: 'sim-3', player_id: 'player-1', month: 1, year: 2026, inflation_rate: 0.044, interest_rate: 0.067, gdp_growth: 0.060, unemployment_rate: 0.039, exchange_rate: 57.00, market_index: 7000, created_at: new Date() },
      ];

      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.simulation.findMany).mockResolvedValue(rows);

      const result = await service.getHistory('user-1');

      expect(result).toHaveLength(3);
      // Verify order: year asc, then month asc
      expect(result[0].year).toBe(2025);
      expect(result[0].month).toBe(1);
      expect(result[1].year).toBe(2025);
      expect(result[1].month).toBe(2);
      expect(result[2].year).toBe(2026);
      expect(result[2].month).toBe(1);
    });
  });

  describe('tickAllAssets integration', () => {
    it('tickAllAssets is called exactly once per advance with the correct next month/year', async () => {
      as<(q: MockArgs) => Promise<null>>(prisma.simulation.findFirst).mockResolvedValue(null);
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.simulation.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'sim-1', created_at: new Date() }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...PLAYER, ...data }));

      await service.advance('user-1');

      // Player starts at month 3, so next month is 4
      expect(mockMarketsService.tickAllAssets).toHaveBeenCalledOnce();
      expect(mockMarketsService.tickAllAssets).toHaveBeenCalledWith({ month: 4, year: 2025 });
    });

    it('tickAllAssets is called after the transaction commits', async () => {
      const callOrder: string[] = [];

      as<(q: MockArgs) => Promise<null>>(prisma.simulation.findFirst).mockResolvedValue(null);

      as<(fn: (tx: MockArgs) => Promise<MockArgs>) => Promise<MockArgs>>(prisma.$transaction)
        .mockImplementation(async (fn: (tx: MockArgs) => Promise<MockArgs>) => {
          const result = await fn(prisma);
          callOrder.push('transaction');
          return result;
        });

      as<(q: MockArgs) => Promise<MockArgs>>(prisma.simulation.create)
        .mockImplementation(async ({ data }: MockArgs) => {
          callOrder.push('simulation-create');
          return { ...data, id: 'sim-1', created_at: new Date() };
        });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => {
          callOrder.push('player-update');
          return { ...PLAYER, ...data };
        });

      mockMarketsService.tickAllAssets.mockImplementation(async () => {
        callOrder.push('tickAllAssets');
        return [];
      });

      await service.advance('user-1');

      // Transaction operations complete before tickAllAssets
      expect(callOrder).toEqual(['simulation-create', 'player-update', 'transaction', 'tickAllAssets']);
    });
  });
});
