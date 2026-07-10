import { prisma } from '../../config/database';
import { AppError } from '../../utils/response';
import { createLogger } from '../../lib/logger';
import { PlayerService } from '../player/player.service';
import { CreateLiabilityInput, UpdateLiabilityInput, LiabilityOutput } from './liabilities.types';

const logger = createLogger('liabilities-service');

export class LiabilitiesService {
  private playerService: PlayerService;

  constructor(playerService: PlayerService) {
    this.playerService = playerService;
  }

  /**
   * Clamped 0-100 because overpayments can make balance
   * go negative, which would break the percentage display
   */
  private computePayoffProgress(original_amount: number, balance: number): number {
    const progress = ((original_amount - balance) / original_amount) * 100;
    return Math.min(100, Math.max(0, Math.round(progress * 10) / 10));
  }

  private toOutput(liability: { id: string; player_id: string; name: string; type: string; balance: number; original_amount: number; interest_rate: number; minimum_payment: number; month_started: number; created_at: Date; updated_at: Date }): LiabilityOutput {
    return {
      ...liability,
      payoff_progress: this.computePayoffProgress(liability.original_amount, liability.balance),
    };
  }

  /** Create a new liability linked to the authenticated player. */
  async create(userId: string, data: CreateLiabilityInput): Promise<LiabilityOutput> {
    const player = await this.playerService.getProfile(userId);

    const liability = await prisma.liability.create({
      data: {
        player_id: player.id,
        name: data.name,
        type: data.type,
        balance: data.balance,
        original_amount: data.original_amount,
        interest_rate: data.interest_rate,
        minimum_payment: data.minimum_payment,
        month_started: data.month_started,
      },
    });

    logger.info('Liability created', { playerId: player.id, liabilityId: liability.id, type: data.type });

    return this.toOutput(liability);
  }

  /** Fetch all liabilities for a player, ordered by highest interest rate first. */
  async getAll(userId: string): Promise<LiabilityOutput[]> {
    const player = await this.playerService.getProfile(userId);

    const liabilities = await prisma.liability.findMany({
      where: { player_id: player.id },
      orderBy: { interest_rate: 'desc' },
    });

    return liabilities.map((l) => this.toOutput(l));
  }

  /** Update balance or minimum_payment on an existing liability. */
  async update(userId: string, liabilityId: string, data: UpdateLiabilityInput): Promise<LiabilityOutput> {
    const player = await this.playerService.getProfile(userId);

    const liability = await prisma.liability.findUnique({
      where: { id: liabilityId },
    });

    if (!liability) {
      throw new AppError('Liability not found', 404);
    }

    // 403 instead of 404 — returning 404 would reveal the liability
    // exists to someone who doesn't own it
    if (liability.player_id !== player.id) {
      throw new AppError('Forbidden', 403);
    }

    const updated = await prisma.liability.update({
      where: { id: liabilityId },
      data: {
        ...(data.balance !== undefined && { balance: data.balance }),
        ...(data.minimum_payment !== undefined && { minimum_payment: data.minimum_payment }),
      },
    });

    logger.info('Liability updated', { playerId: player.id, liabilityId });

    return this.toOutput(updated);
  }

  /** Permanently remove a liability. */
  async delete(userId: string, liabilityId: string): Promise<void> {
    const player = await this.playerService.getProfile(userId);

    const liability = await prisma.liability.findUnique({
      where: { id: liabilityId },
    });

    if (!liability) {
      throw new AppError('Liability not found', 404);
    }

    // 403 instead of 404 — returning 404 would reveal the liability
    // exists to someone who doesn't own it
    if (liability.player_id !== player.id) {
      throw new AppError('Forbidden', 403);
    }

    await prisma.liability.delete({
      where: { id: liabilityId },
    });

    logger.info('Liability deleted', { playerId: player.id, liabilityId });
  }
}
