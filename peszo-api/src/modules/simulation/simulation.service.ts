// No simulation.schema.ts — POST /advance takes no body and
// GET /history takes no query params, so there is nothing to
// validate. Every other module has 6 files per AGENTS.md; this
// is an intentional deviation, not an oversight.

import { prisma } from '../../config/database';
import { createLogger } from '../../lib/logger';
import { gaussianRandom, clamp } from '../../utils/random';
import { PlayerService } from '../player/player.service';
import { MarketsService } from '../markets/markets.service';
import { SimulationOutput } from './simulation.types';

const logger = createLogger('simulation-service');

const STARTING_INDICATORS = {
  inflation_rate: 0.042,
  interest_rate: 0.065,
  gdp_growth: 0.058,
  unemployment_rate: 0.041,
  exchange_rate: 56.40,
  market_index: 6842,
} as const;

const INDICATOR_BOUNDS = {
  inflation_rate:    { min: 0.01, max: 0.15 },
  interest_rate:     { min: 0.01, max: 0.20 },
  gdp_growth:        { min: -0.05, max: 0.10 },
  unemployment_rate: { min: 0.02, max: 0.15 },
  exchange_rate:     { min: 45, max: 75 },
  market_index:      { min: 4000, max: 12000 },
} as const;

const computeNextMonth = (month: number, year: number): { month: number; year: number } => {
  if (month === 12) {
    return { month: 1, year: year + 1 };
  }
  return { month: month + 1, year };
};

export class SimulationService {
  private playerService: PlayerService;
  private marketsService: MarketsService;

  constructor(playerService: PlayerService, marketsService: MarketsService) {
    this.playerService = playerService;
    this.marketsService = marketsService;
  }

  /**
   * Advance the simulation by one month. Creates a new macro-economic
   * snapshot and ticks all asset prices forward. The transaction commits
   * the snapshot and player month advance atomically; asset tick is
   * deliberately outside so a failed tick does not block progress.
   */
  async advance(userId: string): Promise<SimulationOutput> {
    const player = await this.playerService.getProfile(userId);

    const previousRow = await prisma.simulation.findFirst({
      where: { player_id: player.id },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    if (!previousRow) {
      return this.advanceFirstTime(player.id, player.simulation_month, player.simulation_year);
    }

    return this.advanceExisting(player.id, previousRow);
  }

  /** Return all simulation rows for a player in chronological order. */
  async getHistory(userId: string): Promise<SimulationOutput[]> {
    const player = await this.playerService.getProfile(userId);

    const rows = await prisma.simulation.findMany({
      where: { player_id: player.id },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });

    return rows;
  }

  private async advanceFirstTime(
    playerId: string,
    currentMonth: number,
    currentYear: number,
  ): Promise<SimulationOutput> {
    const { month: nextMonth, year: nextYear } = computeNextMonth(currentMonth, currentYear);

    const created = await prisma.$transaction(async (tx) => {
      const row = await tx.simulation.create({
        data: {
          player_id: playerId,
          month: currentMonth,
          year: currentYear,
          ...STARTING_INDICATORS,
        },
      });

      await tx.player.update({
        where: { id: playerId },
        data: {
          simulation_month: nextMonth,
          simulation_year: nextYear,
        },
      });

      return row;
    });

    await this.marketsService.tickAllAssets({ month: nextMonth, year: nextYear });

    logger.info('Simulation advanced (first time)', {
      playerId,
      month: currentMonth,
      year: currentYear,
    });

    return created;
  }

  private async advanceExisting(
    playerId: string,
    previousRow: { month: number; year: number; inflation_rate: number; interest_rate: number; gdp_growth: number; unemployment_rate: number; exchange_rate: number; market_index: number },
  ): Promise<SimulationOutput> {
    const { month: newMonth, year: newYear } = computeNextMonth(previousRow.month, previousRow.year);

    const newIndicators = {
      inflation_rate:    clamp(previousRow.inflation_rate + gaussianRandom(0, 0.001), INDICATOR_BOUNDS.inflation_rate.min, INDICATOR_BOUNDS.inflation_rate.max),
      interest_rate:     clamp(previousRow.interest_rate + gaussianRandom(0, 0.0005), INDICATOR_BOUNDS.interest_rate.min, INDICATOR_BOUNDS.interest_rate.max),
      gdp_growth:        clamp(previousRow.gdp_growth + gaussianRandom(0, 0.002), INDICATOR_BOUNDS.gdp_growth.min, INDICATOR_BOUNDS.gdp_growth.max),
      unemployment_rate: clamp(previousRow.unemployment_rate + gaussianRandom(0, 0.001), INDICATOR_BOUNDS.unemployment_rate.min, INDICATOR_BOUNDS.unemployment_rate.max),
      exchange_rate:     clamp(previousRow.exchange_rate + gaussianRandom(0, 0.5), INDICATOR_BOUNDS.exchange_rate.min, INDICATOR_BOUNDS.exchange_rate.max),
      market_index:      clamp(previousRow.market_index + gaussianRandom(0, 50), INDICATOR_BOUNDS.market_index.min, INDICATOR_BOUNDS.market_index.max),
    };

    const created = await prisma.$transaction(async (tx) => {
      const row = await tx.simulation.create({
        data: {
          player_id: playerId,
          month: newMonth,
          year: newYear,
          ...newIndicators,
        },
      });

      await tx.player.update({
        where: { id: playerId },
        data: {
          simulation_month: newMonth,
          simulation_year: newYear,
        },
      });

      return row;
    });

    await this.marketsService.tickAllAssets({ month: newMonth, year: newYear });

    logger.info('Simulation advanced', {
      playerId,
      month: newMonth,
      year: newYear,
    });

    return created;
  }
}
