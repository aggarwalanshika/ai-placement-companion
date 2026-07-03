import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { prisma } from './config/db.js';

const server = app.listen(config.port, () => {
  logger.info(`Server is running in ${config.nodeEnv} mode on port ${config.port}`);
});

// Setup graceful termination handler
const gracefulShutdown = async () => {
  logger.info('SIGTERM/SIGINT received. Initiating graceful shutdown...');
  server.close(async () => {
    logger.info('Express server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Database connection pool disconnected.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database disconnection:', err);
      process.exit(1);
    }
  });

  // Timeout shutdown after 10s if connections persist
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing termination.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('unhandledRejection', (reason: Error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(reason.stack || reason.message);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(error.stack || error.message);
  process.exit(1);
});
