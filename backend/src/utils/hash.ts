import bcrypt from 'bcryptjs';

/**
 * Hash raw password using bcrypt with standard salt rounds (12).
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

/**
 * Compare plain text password against hash.
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
