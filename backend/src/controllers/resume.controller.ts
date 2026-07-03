import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { resumeService } from '../services/resume.service.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export class ResumeController {
  public static async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    const file = req.file;

    if (!file) {
      return next(new AppError('No resume file uploaded. Please upload a PDF file.', 400));
    }

    const filePath = file.path;

    try {
      logger.info(`Starting resume analysis for file: ${file.originalname}`);

      // Call analysis service
      const analysisResult = await resumeService.analyzeResume(filePath);

      logger.info(`Resume analysis completed successfully for file: ${file.originalname}`);

      res.status(200).json({
        success: true,
        data: analysisResult,
      });
    } catch (error) {
      logger.error(`Error during resume analysis controller step: ${(error as any).message}`);
      next(error);
    } finally {
      // Ensure the uploaded temporary file is ALWAYS deleted
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error(`Failed to delete temporary file at ${filePath}: ${err.message}`);
        } else {
          logger.info(`Successfully deleted temporary file at ${filePath}`);
        }
      });
    }
  }
}
