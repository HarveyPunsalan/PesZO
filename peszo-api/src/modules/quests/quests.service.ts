import { prisma } from '../../config/database';
import { AppError } from '../../utils/response';
import { createLogger } from '../../lib/logger';
import { PlayerService } from '../player/player.service';
import {
  QuestOutput,
  QuestChoiceOutput,
  QuestStartOutput,
  QuestCompleteOutput,
  QuestStatus,
} from './quests.types';

const logger = createLogger('quests-service');

/**
 * Parse and validate a quest unlock_condition string.
 * Returns null for always-available quests. Throws AppError
 * on malformed or unsupported condition types so bad seed
 * data crashes at startup instead of silently misbehaving.
 */
export const parseUnlockCondition = (
  condition: string | null,
): { type: string; value: string } | null => {
  if (condition === null) return null;

  const parts = condition.split(':');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new AppError(`Invalid unlock condition format: "${condition}"`, 500);
  }

  const [type, value] = parts;

  if (type !== 'level') {
    throw new AppError(`Unsupported unlock condition type: "${type}"`, 500);
  }

  return { type, value };
};

export class QuestService {
  constructor(private playerService: PlayerService) {}

  /**
   * Single centralized method for choice serialization.
   * The chosen choice reveals consequence and is_optimal;
   * all other choices are stripped of those fields permanently,
   * even after the quest is completed.
   */
  private serializeChoice(
    choice: { id: string; label: string; description: string; consequence: string; is_optimal: boolean },
    isChosen: boolean,
  ): QuestChoiceOutput {
    if (isChosen) {
      return {
        id: choice.id,
        label: choice.label,
        description: choice.description,
        consequence: choice.consequence,
        is_optimal: choice.is_optimal,
      };
    }

    return {
      id: choice.id,
      label: choice.label,
      description: choice.description,
    };
  }

  private computeQuestStatus(
    quest: { unlock_condition: string | null },
    playerQuest: { status: string } | null,
    playerLevel: number,
  ): QuestStatus {
    if (playerQuest) {
      if (playerQuest.status === 'completed') return 'completed';
      if (playerQuest.status === 'active') return 'active';
    }

    const parsed = parseUnlockCondition(quest.unlock_condition);

    // null condition means always available
    if (parsed === null) return 'available';

    // only "level" type is supported in v1
    const requiredLevel = parseInt(parsed.value, 10);
    return playerLevel >= requiredLevel ? 'available' : 'locked';
  }

  async getAllQuests(userId: string): Promise<QuestOutput[]> {
    const player = await this.playerService.getProfile(userId);

    const [quests, playerQuests] = await Promise.all([
      prisma.quest.findMany({
        include: { choices: true },
        orderBy: { order_index: 'asc' },
      }),
      prisma.playerQuest.findMany({
        where: { player_id: player.id },
      }),
    ]);

    const playerQuestMap = new Map(playerQuests.map((pq) => [pq.quest_id, pq]));

    return quests.map((quest) => {
      const playerQuest = playerQuestMap.get(quest.id) ?? null;
      const status = this.computeQuestStatus(quest, playerQuest, player.level);
      const chosenChoiceId = playerQuest?.chosen_choice_id ?? null;

      return {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        category: quest.category,
        scenario_text: quest.scenario_text,
        xp_reward: quest.xp_reward,
        unlock_condition: quest.unlock_condition,
        order_index: quest.order_index,
        status,
        choices: quest.choices.map((c) =>
          this.serializeChoice(c, c.id === chosenChoiceId),
        ),
        chosen_choice_id: chosenChoiceId,
        created_at: quest.created_at,
      };
    });
  }

  async getQuestById(userId: string, questId: string): Promise<QuestOutput> {
    const player = await this.playerService.getProfile(userId);

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: { choices: true },
    });

    if (!quest) {
      throw new AppError('Quest not found', 404);
    }

    const playerQuest = await prisma.playerQuest.findUnique({
      where: {
        player_id_quest_id: {
          player_id: player.id,
          quest_id: questId,
        },
      },
    });

    const status = this.computeQuestStatus(quest, playerQuest, player.level);
    const chosenChoiceId = playerQuest?.chosen_choice_id ?? null;

    return {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      category: quest.category,
      scenario_text: quest.scenario_text,
      xp_reward: quest.xp_reward,
      unlock_condition: quest.unlock_condition,
      order_index: quest.order_index,
      status,
      choices: quest.choices.map((c) =>
        this.serializeChoice(c, c.id === chosenChoiceId),
      ),
      chosen_choice_id: chosenChoiceId,
      created_at: quest.created_at,
    };
  }

  async startQuest(userId: string, questId: string): Promise<QuestStartOutput> {
    const player = await this.playerService.getProfile(userId);

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      throw new AppError('Quest not found', 404);
    }

    // Server-side re-check — never trust a prior GET's display
    const parsed = parseUnlockCondition(quest.unlock_condition);
    if (parsed !== null) {
      const requiredLevel = parseInt(parsed.value, 10);
      if (player.level < requiredLevel) {
        throw new AppError('Quest is locked', 403);
      }
    }

    const existing = await prisma.playerQuest.findUnique({
      where: {
        player_id_quest_id: {
          player_id: player.id,
          quest_id: questId,
        },
      },
    });

    if (existing) {
      throw new AppError('Quest already started', 400);
    }

    const playerQuest = await prisma.playerQuest.create({
      data: {
        player_id: player.id,
        quest_id: questId,
        status: 'active',
      },
    });

    logger.info('Quest started', { playerId: player.id, questId });

    return playerQuest;
  }

  async completeQuest(
    userId: string,
    questId: string,
    choiceId: string,
  ): Promise<QuestCompleteOutput> {
    const player = await this.playerService.getProfile(userId);

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: { choices: true },
    });

    if (!quest) {
      throw new AppError('Quest not found', 404);
    }

    const choice = quest.choices.find((c) => c.id === choiceId);
    if (!choice) {
      throw new AppError('Invalid choice for this quest', 400);
    }

    const playerQuest = await prisma.playerQuest.findUnique({
      where: {
        player_id_quest_id: {
          player_id: player.id,
          quest_id: questId,
        },
      },
    });

    if (!playerQuest || playerQuest.status !== 'active') {
      throw new AppError('Quest not started', 400);
    }

    // Compute new XP and level before writing so both values are
    // consistent regardless of which write runs first in the transaction
    const newXp = player.xp + quest.xp_reward;
    const newLevel = Math.floor(newXp / 100) + 1;

    const [updatedPlayerQuest] = await prisma.$transaction([
      prisma.playerQuest.update({
        where: { id: playerQuest.id },
        data: {
          status: 'completed',
          chosen_choice_id: choiceId,
          completed_at: new Date(),
        },
      }),
      prisma.player.update({
        where: { id: player.id },
        data: {
          xp: newXp,
          level: newLevel,
        },
      }),
    ]);

    logger.info('Quest completed', {
      playerId: player.id,
      questId,
      xpAwarded: quest.xp_reward,
      newXp,
      newLevel,
    });

    return {
      player_quest: updatedPlayerQuest,
      chosen_choice: this.serializeChoice(choice, true),
      xp_awarded: quest.xp_reward,
      new_xp_total: newXp,
      new_level: newLevel,
      leveled_up: newLevel > player.level,
    };
  }
}
