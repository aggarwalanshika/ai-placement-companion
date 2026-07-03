import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { loggerMiddleware } from './middleware/logger.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import healthRoutes from './routes/health.routes.js';
import { AppError } from './utils/appError.js';

const app: Express = express();

// Apply Security and Optimization Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow dev matching, will restrict in production config
  credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Logger Middleware
app.use(loggerMiddleware);

// Declare API Routes
app.use('/api/health', healthRoutes);

// Catch-all route to raise 404 Operational Error
app.use((req: Request, res: Response, next: NextFunction) => {
  res; // Reference to satisfy strict typescript checks
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server.`, 404));
});

// Apply Global Error Interceptor
app.use(errorMiddleware);

export default app;
