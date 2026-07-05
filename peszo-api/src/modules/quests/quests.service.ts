import { AppError } from '../../utils/response';
import { Quest } from './quests.types';

export class QuestsService {
  async getQuests(_userId: string): Promise<Quest[]> {
    // TODO: implement when Quests module is built
    // This will use prisma.quest.findMany() to get all quests
    throw new AppError('Not implemented', 501);
  }

  async completeQuest(_userId: string, _questId: string): Promise<Quest> {
    // TODO: implement when Quests module is built
    // This will use prisma.quest.findUnique() to get quest
    // This will use prisma.quest.update() to mark as completed
    throw new AppError('Not implemented', 501);
  }
}
