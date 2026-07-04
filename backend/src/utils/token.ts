import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Generate cryptographically signed Access Token (short-lived)
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiration as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Generate cryptographically signed Refresh Token (long-lived)
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiration as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Verify Access Token and extract payload
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

/**
 * Verify Refresh Token and extract payload
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};
