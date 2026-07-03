import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate-limiter for Auth routes.
 * Limits IP addresses to a max number of requests per window (ms).
 */
export const rateLimiter = (windowMs: number, maxRequests: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res; // Reference to satisfy strict checks
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    const record = memoryStore.get(ip);

    if (!record) {
      memoryStore.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count += 1;

    if (record.count > maxRequests) {
      return next(new AppError('Too many requests from this IP address. Please try again later.', 429));
    }

    next();
  };
};
