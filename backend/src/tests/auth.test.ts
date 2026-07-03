import { AuthService } from '../services/auth.service.js';
import { prisma } from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';

// Mock Prisma Client
jest.mock('../config/db.js', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    profile: {
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../utils/hash.js', () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

describe('AuthService unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should throw an error if the user already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-id' });

      await expect(
        AuthService.signup({
          email: 'test@example.com',
          password: 'Password123!',
          fullName: 'Test User',
        })
      ).rejects.toThrow('Email address is already registered');
    });

    it('should create user and profile on successful signup', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed_password');

      // Mock prisma transaction execution
      const mockTx = {
        user: { create: jest.fn().mockResolvedValue({ id: 'user-id', email: 'test@example.com' }) },
        profile: { create: jest.fn().mockResolvedValue({ fullName: 'Test User' }) },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await AuthService.signup({
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        fullName: 'Test User',
      });
    });
  });

  describe('login', () => {
    it('should throw an error on invalid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should return token payloads on successful password verification', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        profile: { fullName: 'Test User' },
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      const response = await AuthService.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(response.user.fullName).toBe('Test User');
      expect(response.accessToken).toBeDefined();
      expect(response.refreshToken).toBeDefined();
    });
  });
});
