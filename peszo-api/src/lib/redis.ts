import { createClient, RedisClientType } from 'redis';
import { env } from '../config/env';
import { logger } from './logger';

export const redisClient: RedisClientType = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

redisClient.on('connect', () => {
  logger.info('Redis connected');
});

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
};

export const closeRedis = async (): Promise<void> => {
  await redisClient.quit();
};
