import winston from 'winston';
import { env } from '../config/env';

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const devFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: env.NODE_ENV === 'production' ? jsonFormat : devFormat,
  defaultMeta: { service: 'peszo-api' },
  transports: [new winston.transports.Console()],
});

export const createLogger = (requestId: string) => {
  return logger.child({ requestId });
};
