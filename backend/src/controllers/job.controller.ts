import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export class JobController {
  public static async match(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info('API call received: POST /api/job/match');

    const { resumeText, jobDescription } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      logger.error('Match failed: Insufficient or missing resumeText.');
      return next(new AppError('A valid resume text of at least 50 characters is required.', 400));
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
      logger.error('Match failed: Insufficient or missing jobDescription.');
      return next(new AppError('A valid job description of at least 20 characters is required.', 400));
    }

    logger.info(`Resume text length: ${resumeText.length} characters`);
    logger.info(`Job Description text length: ${jobDescription.length} characters`);

    try {
      const matchResult = await jobService.matchJob(resumeText, jobDescription);
      
      logger.info('Job matching completed successfully');
      logger.info(`Final JSON Returned: ${JSON.stringify(matchResult, null, 2)}`);

      res.status(200).json({
        success: true,
        data: matchResult,
      });
    } catch (error) {
      logger.error(`Error during job matching controller step: ${(error as any).message}`);
      next(error);
    }
  }
}
