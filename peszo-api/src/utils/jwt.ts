import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './response';
import { JwtPayload } from '../middleware/auth.middleware';

/**
 * Generate access and refresh token pair for a user.
 * Access token expires in 15 minutes, refresh in 7 days.
 */
export const generateTokens = (
  userId: string,
  email: string
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { userId, email },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, email },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Verify an access token signed with JWT_SECRET.
 * Returns the decoded payload on success, throws AppError on failure.
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError('Invalid token', 401);
  }
};

/**
 * Verify a refresh token signed with REFRESH_TOKEN_SECRET.
 * Returns the decoded payload on success, throws AppError on failure.
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as JwtPayload;
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }
};
