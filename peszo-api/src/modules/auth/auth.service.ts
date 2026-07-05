import { AppError } from '../../utils/response';
import { hashPassword, verifyPassword } from '../../utils/password';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { RegisterInput, LoginInput, RefreshInput, AuthOutput } from './auth.types';

export class AuthService {
  async register(data: RegisterInput): Promise<AuthOutput> {
    // TODO: implement when Auth module is built
    // This will use prisma.user.findUnique() to check for existing user
    // This will use prisma.user.create() to create new user
    throw new AppError('Not implemented', 501);
  }

  async login(data: LoginInput): Promise<AuthOutput> {
    // TODO: implement when Auth module is built
    // This will use prisma.user.findUnique() to find user by email
    // This will use verifyPassword() to check password
    throw new AppError('Not implemented', 501);
  }

  async refresh(data: RefreshInput): Promise<{ accessToken: string }> {
    const payload = jwt.verify(data.refreshToken, env.REFRESH_TOKEN_SECRET) as { userId: string; email: string };
    const accessToken = jwt.sign({ userId: payload.userId, email: payload.email }, env.JWT_SECRET, { expiresIn: '15m' });
    return { accessToken };
  }

  async logout(_data: { refreshToken: string }): Promise<void> {
    // TODO: implement when Auth module is built
    // Token invalidation logic will be added with Redis
  }

  private generateTokens(userId: string, email: string): AuthOutput {
    const accessToken = jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, email }, env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }
}
