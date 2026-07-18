// @ts-nocheck - mock types intentionally diverge from Prisma client types;
// vi.restoreAllMocks() resets mocks to their original typed signatures,
// making runtime-correct casts fail at the type level.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuestService, parseUnlockCondition } from './quests.service';

vi.mock('../../config/database', () => {
  const mockPrisma = {
    quest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    playerQuest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    player: {
      update: vi.fn(),
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockArgs = Record<string, any>;

const as = <T>(fn: ReturnType<typeof vi.fn>): T => fn as unknown as T;

const PLAYER = {
  id: 'player-1',
  user_id: 'user-1',
  name: 'Test Player',
  simulation_month: 1,
  simulation_year: 2025,
  health_score: 0,
  xp: 0,
  level: 1,
  job_situation: 'employed',
  monthly_salary: 50000,
  created_at: new Date(),
  updated_at: new Date(),
};

const QUEST_1 = {
  id: 'quest-1',
  title: 'Emergency Fund',
  description: 'Build a financial safety net.',
  category: 'personal_finance',
  scenario_text: 'Your first paycheck arrives.',
  xp_reward: 50,
  unlock_condition: null,
  order_index: 1,
  created_at: new Date(),
  choices: [] as MockArgs[],
};

const QUEST_2 = {
  id: 'quest-2',
  title: 'First Portfolio Allocation',
  description: 'Learn to diversify.',
  category: 'investing',
  scenario_text: 'You are ready to invest.',
  xp_reward: 100,
  unlock_condition: 'level:2',
  order_index: 2,
  created_at: new Date(),
  choices: [] as MockArgs[],
};

const CHOICE_1A = { id: 'c1a', quest_id: 'quest-1', label: 'Option A', description: 'Desc A', consequence: 'Bad outcome', is_optimal: false, created_at: new Date() };
const CHOICE_1B = { id: 'c1b', quest_id: 'quest-1', label: 'Option B', description: 'Desc B', consequence: 'Great outcome', is_optimal: true, created_at: new Date() };

describe('parseUnlockCondition', () => {
  it('returns null for null input', () => {
    expect(parseUnlockCondition(null)).toBeNull();
  });

  it('parses a valid level condition', () => {
    expect(parseUnlockCondition('level:2')).toEqual({ type: 'level', value: '2' });
  });

  it('throws on unsupported type', () => {
    expect(() => parseUnlockCondition('xp:500')).toThrow('Unsupported unlock condition type: "xp"');
  });

  it('throws on malformed string without colon', () => {
    expect(() => parseUnlockCondition('invalid')).toThrow('Invalid unlock condition format');
  });

  it('throws on empty value after colon', () => {
    expect(() => parseUnlockCondition('level:')).toThrow('Invalid unlock condition format');
  });

  it('throws on empty type before colon', () => {
    expect(() => parseUnlockCondition(':2')).toThrow('Invalid unlock condition format');
  });
});

describe('QuestService', () => {
  let service: QuestService;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    service = new QuestService(mockPlayerService as never);
    mockPlayerService.getProfile.mockResolvedValue(PLAYER);
  });

  describe('getAllQuests', () => {
    it('computes available status for quests with null unlock_condition', async () => {
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([QUEST_1]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([]);

      const result = await service.getAllQuests('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('available');
    });

    it('computes locked status when player level is below unlock requirement', async () => {
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([QUEST_2]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([]);

      const result = await service.getAllQuests('user-1');

      expect(result[0].status).toBe('locked');
    });

    it('computes available status when player meets level requirement', async () => {
      mockPlayerService.getProfile.mockResolvedValue({ ...PLAYER, level: 2 });
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([QUEST_2]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([]);

      const result = await service.getAllQuests('user-1');

      expect(result[0].status).toBe('available');
    });

    it('computes active status when PlayerQuest exists with active status', async () => {
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([QUEST_1]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([
        { id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'active', chosen_choice_id: null, completed_at: null, created_at: new Date() },
      ]);

      const result = await service.getAllQuests('user-1');

      expect(result[0].status).toBe('active');
    });

    it('computes completed status when PlayerQuest exists with completed status', async () => {
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([QUEST_1]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([
        { id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'completed', chosen_choice_id: 'c1b', completed_at: new Date(), created_at: new Date() },
      ]);

      const result = await service.getAllQuests('user-1');

      expect(result[0].status).toBe('completed');
    });

    it('includes all 4 statuses across different quest/player combinations', async () => {
      mockPlayerService.getProfile.mockResolvedValue({ ...PLAYER, level: 2 });
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([
        QUEST_1,
        QUEST_2,
      ]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([
        { id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'completed', chosen_choice_id: 'c1b', completed_at: new Date(), created_at: new Date() },
      ]);

      const result = await service.getAllQuests('user-1');

      expect(result[0].status).toBe('completed');
      expect(result[1].status).toBe('available');
    });
  });

  describe('choice visibility', () => {
    it('unchosen choices never expose consequence or is_optimal on a non-completed quest', async () => {
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([
        { ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] },
      ]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([]);

      const result = await service.getAllQuests('user-1');

      for (const choice of result[0].choices) {
        expect(choice).not.toHaveProperty('consequence');
        expect(choice).not.toHaveProperty('is_optimal');
      }
    });

    it('unchosen choices never expose consequence or is_optimal even on a completed quest', async () => {
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([
        { ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] },
      ]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([
        { id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'completed', chosen_choice_id: 'c1b', completed_at: new Date(), created_at: new Date() },
      ]);

      const result = await service.getAllQuests('user-1');

      const unchosen = result[0].choices.find((c) => c.id === 'c1a');
      expect(unchosen).toBeDefined();
      expect(unchosen).not.toHaveProperty('consequence');
      expect(unchosen).not.toHaveProperty('is_optimal');
    });

    it('chosen choice on a completed quest DOES expose consequence and is_optimal', async () => {
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([
        { ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] },
      ]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([
        { id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'completed', chosen_choice_id: 'c1b', completed_at: new Date(), created_at: new Date() },
      ]);

      const result = await service.getAllQuests('user-1');

      const chosen = result[0].choices.find((c) => c.id === 'c1b');
      expect(chosen).toBeDefined();
      expect(chosen!.consequence).toBe('Great outcome');
      expect(chosen!.is_optimal).toBe(true);
    });

    it('chosen_choice_id is populated from real PlayerQuest data in list view', async () => {
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([QUEST_1]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([
        { id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'completed', chosen_choice_id: 'c1b', completed_at: new Date(), created_at: new Date() },
      ]);

      const result = await service.getAllQuests('user-1');

      expect(result[0].chosen_choice_id).toBe('c1b');
    });

    it('chosen_choice_id is null for non-completed quests', async () => {
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.quest.findMany).mockResolvedValue([QUEST_1]);
      as<(q: MockArgs) => Promise<MockArgs[]>>(prisma.playerQuest.findMany).mockResolvedValue([
        { id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'active', chosen_choice_id: null, completed_at: null, created_at: new Date() },
      ]);

      const result = await service.getAllQuests('user-1');

      expect(result[0].chosen_choice_id).toBeNull();
    });
  });

  describe('getQuestById', () => {
    it('returns a single quest with correct status', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue({ ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.playerQuest.findUnique).mockResolvedValue(null);

      const result = await service.getQuestById('user-1', 'quest-1');

      expect(result.id).toBe('quest-1');
      expect(result.status).toBe('available');
    });

    it('throws 404 if quest not found', async () => {
      as<(q: MockArgs) => Promise<null>>(prisma.quest.findUnique).mockResolvedValue(null);

      await expect(service.getQuestById('user-1', 'nonexistent'))
        .rejects.toThrow('Quest not found');
    });
  });

  describe('startQuest', () => {
    it('creates a PlayerQuest with active status on happy path', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue(QUEST_1);
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.playerQuest.findUnique).mockResolvedValue(null);
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.playerQuest.create)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...data, id: 'pq-1', created_at: new Date() }));

      const result = await service.startQuest('user-1', 'quest-1');

      expect(result.status).toBe('active');
      expect(result.quest_id).toBe('quest-1');
    });

    it('throws 403 if unlock_condition is not met', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue(QUEST_2);

      await expect(service.startQuest('user-1', 'quest-2'))
        .rejects.toThrow('Quest is locked');
    });

    it('throws 400 if PlayerQuest already exists', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue(QUEST_1);
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.playerQuest.findUnique).mockResolvedValue({
        id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'active', chosen_choice_id: null, completed_at: null, created_at: new Date(),
      });

      await expect(service.startQuest('user-1', 'quest-1'))
        .rejects.toThrow('Quest already started');
    });

    it('throws 404 if quest does not exist', async () => {
      as<(q: MockArgs) => Promise<null>>(prisma.quest.findUnique).mockResolvedValue(null);

      await expect(service.startQuest('user-1', 'nonexistent'))
        .rejects.toThrow('Quest not found');
    });
  });

  describe('completeQuest', () => {
    it('throws 400 if choice_id does not belong to the quest', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue({ ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] });

      await expect(service.completeQuest('user-1', 'quest-1', 'wrong-choice'))
        .rejects.toThrow('Invalid choice for this quest');
    });

    it('throws 400 if no active PlayerQuest exists', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue({ ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] });
      as<(q: MockArgs) => Promise<null>>(prisma.playerQuest.findUnique).mockResolvedValue(null);

      await expect(service.completeQuest('user-1', 'quest-1', 'c1b'))
        .rejects.toThrow('Quest not started');
    });

    it('throws 400 if PlayerQuest is already completed', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue({ ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.playerQuest.findUnique).mockResolvedValue({
        id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'completed', chosen_choice_id: 'c1b', completed_at: new Date(), created_at: new Date(),
      });

      await expect(service.completeQuest('user-1', 'quest-1', 'c1b'))
        .rejects.toThrow('Quest not started');
    });

    it('correctly computes and persists xp and level', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue({ ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.playerQuest.findUnique).mockResolvedValue({
        id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'active', chosen_choice_id: null, completed_at: null, created_at: new Date(),
      });

      let updatedXp: number | undefined;
      let updatedLevel: number | undefined;
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => {
          updatedXp = data.xp;
          updatedLevel = data.level;
          return { ...PLAYER, ...data };
        });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.playerQuest.update)
        .mockImplementation(async ({ data }: MockArgs) => ({
          id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', ...data, created_at: new Date(),
        }));

      const result = await service.completeQuest('user-1', 'quest-1', 'c1b');

      expect(result.xp_awarded).toBe(50);
      expect(result.new_xp_total).toBe(50);
      expect(result.new_level).toBe(Math.floor(50 / 100) + 1);
      expect(updatedXp).toBe(50);
      expect(updatedLevel).toBe(1);
    });

    it('correctly computes level at xp thresholds', async () => {
      mockPlayerService.getProfile.mockResolvedValue({ ...PLAYER, xp: 95, level: 1 });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue({ ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.playerQuest.findUnique).mockResolvedValue({
        id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'active', chosen_choice_id: null, completed_at: null, created_at: new Date(),
      });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.playerQuest.update)
        .mockImplementation(async ({ data }: MockArgs) => ({
          id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', ...data, created_at: new Date(),
        }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...PLAYER, ...data }));

      const result = await service.completeQuest('user-1', 'quest-1', 'c1b');

      expect(result.new_xp_total).toBe(145);
      expect(result.new_level).toBe(2);
    });

    it('leveled_up is true only when new_level > old level', async () => {
      mockPlayerService.getProfile.mockResolvedValue({ ...PLAYER, xp: 95, level: 1 });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue({ ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.playerQuest.findUnique).mockResolvedValue({
        id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'active', chosen_choice_id: null, completed_at: null, created_at: new Date(),
      });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.playerQuest.update)
        .mockImplementation(async ({ data }: MockArgs) => ({
          id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', ...data, created_at: new Date(),
        }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...PLAYER, ...data }));

      const result = await service.completeQuest('user-1', 'quest-1', 'c1b');

      expect(result.leveled_up).toBe(true);
    });

    it('leveled_up is false when level does not change', async () => {
      mockPlayerService.getProfile.mockResolvedValue({ ...PLAYER, xp: 10, level: 1 });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue({ ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.playerQuest.findUnique).mockResolvedValue({
        id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'active', chosen_choice_id: null, completed_at: null, created_at: new Date(),
      });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.playerQuest.update)
        .mockImplementation(async ({ data }: MockArgs) => ({
          id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', ...data, created_at: new Date(),
        }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...PLAYER, ...data }));

      const result = await service.completeQuest('user-1', 'quest-1', 'c1b');

      expect(result.leveled_up).toBe(false);
    });

    it('the chosen choice in the response includes consequence and is_optimal', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue({ ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.playerQuest.findUnique).mockResolvedValue({
        id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'active', chosen_choice_id: null, completed_at: null, created_at: new Date(),
      });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.playerQuest.update)
        .mockImplementation(async ({ data }: MockArgs) => ({
          id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', ...data, created_at: new Date(),
        }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...PLAYER, ...data }));

      const result = await service.completeQuest('user-1', 'quest-1', 'c1b');

      expect(result.chosen_choice.consequence).toBe('Great outcome');
      expect(result.chosen_choice.is_optimal).toBe(true);
    });

    it('both playerQuest.update and player.update are called in one transaction', async () => {
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.quest.findUnique).mockResolvedValue({ ...QUEST_1, choices: [CHOICE_1A, CHOICE_1B] });
      as<(q: MockArgs) => Promise<MockArgs | null>>(prisma.playerQuest.findUnique).mockResolvedValue({
        id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', status: 'active', chosen_choice_id: null, completed_at: null, created_at: new Date(),
      });
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.playerQuest.update)
        .mockImplementation(async ({ data }: MockArgs) => ({
          id: 'pq-1', player_id: 'player-1', quest_id: 'quest-1', ...data, created_at: new Date(),
        }));
      as<(q: MockArgs) => Promise<MockArgs>>(prisma.player.update)
        .mockImplementation(async ({ data }: MockArgs) => ({ ...PLAYER, ...data }));

      await service.completeQuest('user-1', 'quest-1', 'c1b');

      expect(prisma.$transaction).toHaveBeenCalledOnce();
      const callArg = as<MockArgs>(prisma.$transaction).mock.calls[0][0];
      expect(Array.isArray(callArg)).toBe(true);
      expect(callArg).toHaveLength(2);
    });
  });
});
