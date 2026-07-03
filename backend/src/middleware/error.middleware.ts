import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export const errorMiddleware = (
  err: Error & { statusCode?: number; status?: string },
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next; // Reference to satisfy strict typescript checks
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (config.nodeEnv === 'development') {
    logger.error(err.stack || '');
  }

  if (config.nodeEnv === 'development') {
    res.status(statusCode).json({
      success: false,
      status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // Production Mode: do not leak developer details
    if (err instanceof AppError && err.isOperational) {
      res.status(statusCode).json({
        success: false,
        status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went wrong on our end. Please try again later.',
      });
    }
  }
};
