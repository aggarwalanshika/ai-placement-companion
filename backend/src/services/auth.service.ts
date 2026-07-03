import { prisma } from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { AppError } from '../utils/appError.js';
import { SignupInput, LoginInput } from '../utils/validators.js';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new user and create their profile inside a transaction
   */
  public static async signup(input: SignupInput): Promise<{ id: string; email: string; fullName: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('Email address is already registered', 409);
    }

    const hashedPassword = await hashPassword(input.password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash: hashedPassword,
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          fullName: input.fullName,
        },
      });

      return {
        id: user.id,
        email: user.email,
        fullName: profile.fullName,
      };
    });

    return result;
  }

  /**
   * Log in an existing user and generate Access/Refresh tokens
   */
  public static async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { profile: true },
    });

    if (!user || !user.passwordHash || !user.profile) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await verifyPassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days matching config
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile.fullName,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rotate user Access and Refresh tokens (Refresh Token Rotation pattern)
   */
  public static async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      // If a revoked token is re-submitted, detect breach and revoke all tokens for that user
      if (storedToken?.isRevoked) {
        await prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId },
          data: { isRevoked: true },
        });
      }
      throw new AppError('Invalid, expired, or compromised refresh token', 401);
    }

    // Revoke current token
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });

    // Generate new pair
    const tokenPayload = { userId: payload.userId, email: payload.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Save new refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoke current refresh token on logout
   */
  public static async logout(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  /**
   * Retrieve active user and profile details by ID
   */
  public static async getUserById(userId: string): Promise<{ id: string; email: string; fullName: string; isEmailVerified: boolean }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.profile.fullName,
      isEmailVerified: user.isEmailVerified,
    };
  }
}
