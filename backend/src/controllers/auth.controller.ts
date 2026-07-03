import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { config } from '../config/index.js';

const COOKIE_NAME = 'refreshToken';

const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export class AuthController {
  public static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.signup(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await AuthService.login(req.body);
      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({
        success: true,
        accessToken,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentRefreshToken = req.cookies[COOKIE_NAME];
      const { accessToken, refreshToken } = await AuthService.refresh(currentRefreshToken);
      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentRefreshToken = req.cookies[COOKIE_NAME];
      if (currentRefreshToken) {
        await AuthService.logout(currentRefreshToken);
      }
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
      });
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.user is set by the auth middleware
      const userId = (req as any).user.userId;
      const user = await AuthService.getUserById(userId);
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
}
