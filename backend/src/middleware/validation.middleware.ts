import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/appError.js';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res; // Reference to satisfy strict typescript checks
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => issue.message).join(', ');
        next(new AppError(`Validation failed: ${errorMessages}`, 400));
      } else {
        next(error);
      }
    }
  };
};
