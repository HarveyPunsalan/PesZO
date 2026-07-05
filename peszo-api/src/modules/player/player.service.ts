import { AppError } from '../../utils/response';
import { UpdateProfileInput, PlayerProfile } from './player.types';

export class PlayerService {
  async getProfile(_userId: string): Promise<PlayerProfile> {
    // TODO: implement when Player module is built
    // This will use prisma.user.findUnique() to get user profile
    throw new AppError('Not implemented', 501);
  }

  async updateProfile(_userId: string, _data: UpdateProfileInput): Promise<PlayerProfile> {
    // TODO: implement when Player module is built
    // This will use prisma.user.findUnique() to check user exists
    // This will use prisma.user.update() to update profile
    throw new AppError('Not implemented', 501);
  }
}
