import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
};

// Validate critical values
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is missing. Please check your .env configuration.');
}
