import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    req; // Reference to satisfy strict typescript checks
    // Perform simple query to verify database connection latency
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: 'connected',
          latencyMs: dbLatency,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
