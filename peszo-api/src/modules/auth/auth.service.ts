import { prisma } from '../../config/database';
import { AppError } from '../../utils/response';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt';
import { createLogger } from '../../lib/logger';
import { RegisterInput, LoginInput, AuthOutput, UserWithoutPassword } from './auth.types';

const logger = createLogger('auth-service');

/**
 * Remove password hash before returning user data to callers.
 * Prisma returns all columns including password; this ensures
 * no hash leaks into response bodies or logs.
 */
const stripPassword = (user: { id: string; email: string; password: string; created_at: Date; updated_at: Date }): UserWithoutPassword => {
  const { password: _, ...rest } = user;
  return rest;
};

export class AuthService {
  /**
   * Create a new user account. Checks for duplicate email first
   * to give a clear 409 instead of a Prisma unique constraint error.
   */
  async register(data: RegisterInput): Promise<AuthOutput> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    const tokens = generateTokens(user.id, user.email);

    // Store refresh token server-side so it can be revoked on logout
    // or invalidated if a newer rotation has occurred.
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: tokens.refreshToken },
    });

    logger.info('User registered', { userId: user.id });

    return {
      user: stripPassword(user),
      ...tokens,
    };
  }

  /**
   * Authenticate an existing user. Both "user not found" and
   * "wrong password" throw the same error to prevent email enumeration.
   */
  async login(data: LoginInput): Promise<AuthOutput> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await verifyPassword(user.password, data.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = generateTokens(user.id, user.email);

    // Overwrites any previous refresh token — only one active
    // session per user is supported by this schema design.
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: tokens.refreshToken },
    });

    logger.info('User logged in', { userId: user.id });

    return {
      user: stripPassword(user),
      ...tokens,
    };
  }

  /**
   * Issue new tokens after verifying the refresh token is valid
   * and still matches the one stored in the database.
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    // JWT signature is valid but the token doesn't match what's in
    // the DB — means it was already rotated or revoked server-side.
    if (!user || user.refresh_token !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokens = generateTokens(user.id, user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: tokens.refreshToken },
    });

    logger.info('Tokens refreshed', { userId: user.id });

    return tokens;
  }

  /**
   * Clear the stored refresh token. Uses updateMany so the call
   * is idempotent — no error if the token was already cleared.
   */
  async logout(refreshToken: string): Promise<void> {
    const payload = verifyRefreshToken(refreshToken);

    await prisma.user.updateMany({
      where: {
        id: payload.userId,
        refresh_token: refreshToken,
      },
      data: { refresh_token: null },
    });

    logger.info('User logged out', { userId: payload.userId });
  }
}
