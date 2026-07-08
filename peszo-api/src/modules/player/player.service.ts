import { prisma } from '../../config/database';
import { AppError } from '../../utils/response';
import { createLogger } from '../../lib/logger';
import { PlayerSetupInput, PlayerUpdateInput, PlayerProfileOutput } from './player.types';

const logger = createLogger('player-service');

export class PlayerService {
  /**
   * Initialize a new player profile for an authenticated user.
   * Returns the created player with default simulation state.
   */
  async setup(userId: string, data: PlayerSetupInput): Promise<PlayerProfileOutput> {
    const existingPlayer = await prisma.player.findUnique({
      where: { user_id: userId },
    });

    // Check first to give a clear 409 instead of a Prisma unique constraint error
    if (existingPlayer) {
      throw new AppError('Player already exists', 409);
    }

    const player = await prisma.player.create({
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
