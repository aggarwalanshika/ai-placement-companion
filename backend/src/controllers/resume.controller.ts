import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { resumeService } from '../services/resume.service.js';
import { builderService } from '../services/builder.service.js';
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

  public static async rewrite(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info('API call received: POST /api/resume/rewrite');
    const { resumeText, section, bulletPoint } = req.body;

    if (!resumeText || !section || !bulletPoint) {
      logger.error('Rewrite failed: Missing parameters.');
      return next(new AppError('Missing required rewrite parameters: resumeText, section, and bulletPoint are all required.', 400));
    }

    try {
      const result = await resumeService.rewriteBulletPoint(resumeText, section, bulletPoint);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`Error during rewrite controller step: ${(error as any).message}`);
      next(error);
    }
  }

  public static async build(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info('API call received: POST /api/resume/build');
    const { originalSections, acceptedSuggestions } = req.body;

    if (!originalSections || !acceptedSuggestions) {
      return next(new AppError('Missing required parameters: originalSections and acceptedSuggestions are required.', 400));
    }

    try {
      const merged = builderService.mergeResumeChanges(originalSections, acceptedSuggestions);
      
      const validationErrors = builderService.validateResumeStructure(originalSections, merged);
      if (validationErrors.length > 0) {
        logger.error('Build aborted: Structural checks failed.');
        res.status(400).json({
          success: false,
          message: 'Structural preservation validation failed.',
          errors: validationErrors
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: merged,
      });
    } catch (error) {
      logger.error(`Error during build controller step: ${(error as any).message}`);
      next(error);
    }
  }

  public static async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info('API call received: POST /api/resume/validate');
    const { resumeText, parsedSections } = req.body;

    if (!resumeText || !parsedSections) {
      return next(new AppError('Missing required parameters: resumeText and parsedSections are required.', 400));
    }

    try {
      const result = await builderService.validateResume(resumeText, parsedSections);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error(`Error during validate controller step: ${(error as any).message}`);
      next(error);
    }
  }

  public static async exportPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info('API call received: POST /api/resume/export/pdf');
    const { name, email, phone, links, parsedSections, originalSections } = req.body;

    try {
      if (originalSections) {
        const validationErrors = builderService.validateResumeStructure(originalSections, parsedSections);
        if (validationErrors.length > 0) {
          logger.error('PDF generation aborted: Structural checks failed.');
          res.status(400).json({
            success: false,
            message: 'PDF Export blocked: Structural preservation validation failed.',
            errors: validationErrors
          });
          return;
        }
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=optimized_resume.pdf');
      builderService.generatePDF({ name, email, phone, links, parsedSections }, res);
    } catch (error) {
      logger.error(`Error during PDF export controller step: ${(error as any).message}`);
      next(error);
    }
  }

  public static async exportDOCX(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info('API call received: POST /api/resume/export/docx');
    const { name, email, phone, links, parsedSections, originalSections } = req.body;

    try {
      if (originalSections) {
        const validationErrors = builderService.validateResumeStructure(originalSections, parsedSections);
        if (validationErrors.length > 0) {
          logger.error('Word document generation aborted: Structural checks failed.');
          res.status(400).json({
            success: false,
            message: 'DOCX Export blocked: Structural preservation validation failed.',
            errors: validationErrors
          });
          return;
        }
      }

      const html = builderService.generateDOCX({ name, email, phone, links, parsedSections });
      res.setHeader('Content-Type', 'application/msword');
      res.setHeader('Content-Disposition', 'attachment; filename=optimized_resume.doc');
      res.status(200).send(html);
    } catch (error) {
      logger.error(`Error during DOCX export controller step: ${(error as any).message}`);
      next(error);
    }
  }
}
