import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';

const router = Router();

// POST /api/job/match
router.post('/match', JobController.match);

export default router;
