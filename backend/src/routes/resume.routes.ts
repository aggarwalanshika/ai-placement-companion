import { Router } from 'express';
import { uploadResumeMiddleware } from '../middleware/upload.middleware.js';
import { ResumeController } from '../controllers/resume.controller.js';

const router = Router();

// Endpoint for resume upload & analysis
router.post('/analyze', uploadResumeMiddleware, ResumeController.analyze);

export default router;
