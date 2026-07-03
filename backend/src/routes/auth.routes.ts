import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.middleware.js';
import { signupSchema, loginSchema } from '../utils/validators.js';

const router = Router();

// Apply IP-scoped rate-limiting on sensitive Auth endpoints (max 10 signup/login requests per 15 minutes)
const authLimiter = rateLimiter(15 * 60 * 1000, 10);

router.post('/signup', authLimiter, validateRequest(signupSchema), AuthController.signup);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);

export default router;
