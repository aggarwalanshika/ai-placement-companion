import { Router } from 'express';
import { uploadResumeMiddleware } from '../middleware/upload.middleware.js';
import { ResumeController } from '../controllers/resume.controller.js';

const router = Router();

// Endpoint for resume upload & analysis
router.post('/analyze', uploadResumeMiddleware, ResumeController.analyze);

// Endpoint for single bullet point rewrite
router.post('/rewrite', ResumeController.rewrite);

export default router;
