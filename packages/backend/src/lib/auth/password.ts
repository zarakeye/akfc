// lib/auth/password.ts
import bcrypt from 'bcryptjs';

/**
 * Verify that a given plain password matches a given hashed password.
 * @param {string} plainPassword - the password to verify
 * @param {string} hashedPassword - the hashed password to compare with
 * @returns {Promise<boolean>} - true if the password matches, false otherwise
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
