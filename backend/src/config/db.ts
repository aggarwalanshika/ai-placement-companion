import { PrismaClient } from '@prisma/client';
import { config } from './index.js';

// Extend global namespace to prevent multiple Prisma client instances in development mode
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (config.nodeEnv !== 'production') {
  globalThis.prisma = prisma;
}
