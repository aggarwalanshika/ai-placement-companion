import { Router } from 'express';
import { uploadResumeMiddleware } from '../middleware/upload.middleware.js';
import { ResumeController } from '../controllers/resume.controller.js';

const router = Router();

// Endpoint for resume upload & analysis
router.post('/analyze', uploadResumeMiddleware, ResumeController.analyze);

// Endpoint for single bullet point rewrite
router.post('/rewrite', ResumeController.rewrite);

// Resume Builder and Document rendering endpoints
router.post('/build', ResumeController.build);
router.post('/validate', ResumeController.validate);
router.post('/export/pdf', ResumeController.exportPDF);
router.post('/export/docx', ResumeController.exportDOCX);

export default router;
