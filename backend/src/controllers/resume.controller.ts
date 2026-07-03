import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { resumeService } from '../services/resume.service.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export class ResumeController {
  public static async analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info('API call received: POST /api/resume/analyze'); // Step 2 log

    const file = req.file;

    if (!file) {
      logger.error('Analyze failed: No file provided.');
      return next(new AppError('No resume file uploaded. Please upload a PDF file.', 400));
    }

    logger.info(`Uploaded Filename: ${file.originalname}`); // Step 2 log
    logger.info(`Temporary File Location: ${file.path}`);

    const filePath = file.path;

    try {
      // Call analysis service
      const analysisResult = await resumeService.analyzeResume(filePath);

      logger.info(`Resume analysis completed successfully for file: ${file.originalname}`);
      logger.info(`Final JSON Returned: ${JSON.stringify(analysisResult, null, 2)}`); // Step 2 log

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
