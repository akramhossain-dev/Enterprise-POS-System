import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt.
 *
 * @param password - The plaintext password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a bcrypt hash.
 * Uses constant-time comparison to prevent timing attacks.
 *
 * @param password - The plaintext password to check.
 * @param hash - The stored bcrypt hash to compare against.
 * @returns A promise that resolves to a boolean indicating if it is a match.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
