import app from './app';
import { env } from './config/env';
import { prisma, closeDatabase } from './config/database';
import { connectRedis, closeRedis } from './lib/redis';
import { logger } from './lib/logger';

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    await connectRedis();

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        await closeRedis();
        await closeDatabase();
        logger.info('Server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

start();
