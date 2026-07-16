import { prisma } from '../../config/database';
import { AppError } from '../../utils/response';
import { createLogger } from '../../lib/logger';
import { MarketsService } from '../markets/markets.service';
import { PlayerSetupInput, PlayerUpdateInput, PlayerProfileOutput } from './player.types';

const logger = createLogger('player-service');

const STARTING_CASH = 40000;

export class PlayerService {
  constructor(private marketsService: MarketsService) {}

  /**
   * Initialize a new player profile for an authenticated user.
   * Creates the player row and seeds their starting CASH balance
   * inside a single transaction so both succeed or both roll back.
   */
  async setup(userId: string, data: PlayerSetupInput): Promise<PlayerProfileOutput> {
    const existingPlayer = await prisma.player.findUnique({
      where: { user_id: userId },
    });

    // Check first to give a clear 409 instead of a Prisma unique constraint error
    if (existingPlayer) {
      throw new AppError('Player already exists', 409);
    }

    const cashAsset = await this.marketsService.getAssetByTicker('CASH');

    const player = await prisma.$transaction(async (tx) => {
      const player = await tx.player.create({
        data: {
          user_id: userId,
          name: data.name,
          job_situation: data.job_situation,
          monthly_salary: data.monthly_salary,
          simulation_month: 1,
          simulation_year: 2025,
          health_score: 0,
          xp: 0,
          level: 1,
        },
      });

      await tx.portfolio.create({
        data: {
          player_id: player.id,
          asset_id: cashAsset.id,
          quantity: STARTING_CASH,
          avg_buy_price: 1,
        },
      });

      return player;
    });

    logger.info('Player created', { userId, playerId: player.id });

    return player;
  }

  /** Fetch the player profile for an authenticated user. */
  async getProfile(userId: string): Promise<PlayerProfileOutput> {
    const player = await prisma.player.findUnique({
      where: { user_id: userId },
    });

    if (!player) {
      throw new AppError('Player not found', 404);
    }

    return player;
  }

  /** Update only the fields the caller explicitly provided. */
  async updateProfile(userId: string, data: PlayerUpdateInput): Promise<PlayerProfileOutput> {
    const player = await prisma.player.findUnique({
      where: { user_id: userId },
    });

    if (!player) {
      throw new AppError('Player not found', 404);
    }

    // Only overwrite fields that are defined — caller can update one
    // field without inadvertently clearing the other
    const updatedPlayer = await prisma.player.update({
      where: { user_id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.monthly_salary !== undefined && { monthly_salary: data.monthly_salary }),
      },
    });

    logger.info('Player profile updated', { userId });

    return updatedPlayer;
  }
}
