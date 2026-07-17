/**
 * Auth Service Unit Tests
 *
 * Tests core auth utility functions without real DB/Redis connections.
 * Uses mocking to isolate the unit under test.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  ValidationError,
  ForbiddenError,
  TooManyRequestsError,
  ServiceUnavailableError,
} from '../common/errors/AppError';
import { hashPassword, comparePassword } from '../common/utils/password';

// ─────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────

vi.mock('../lib/prisma', () => ({
  prisma: {
    user: { findFirst: vi.fn(), create: vi.fn() },
    role: { findUnique: vi.fn() },
    rolePermission: { findMany: vi.fn().mockResolvedValue([]) },
    refreshToken: { create: vi.fn(), findFirst: vi.fn(), deleteMany: vi.fn(), delete: vi.fn() },
    employee: { findFirst: vi.fn() },
  },
}));

vi.mock('../modules/notification/queue', () => ({
  redisConnection: { get: vi.fn(), set: vi.fn(), del: vi.fn(), quit: vi.fn() },
}));

// ─────────────────────────────────────────────
// Tests — Password Utilities
// ─────────────────────────────────────────────

describe('Password Utils', () => {
  it('should hash and verify passwords correctly', async () => {
    const password = 'SecurePassword123!';
    const hashed = await hashPassword(password);

    expect(hashed).not.toBe(password);
    expect(hashed.startsWith('$2b$')).toBe(true);

    const isValid = await comparePassword(password, hashed);
    expect(isValid).toBe(true);
  });

  it('should reject wrong passwords', async () => {
    const password = 'SecurePassword123!';
    const hashed = await hashPassword(password);

    const isInvalid = await comparePassword('WrongPassword', hashed);
    expect(isInvalid).toBe(false);
  });
});

// ─────────────────────────────────────────────
// Tests — Refresh Token Expiry Parsing
// ─────────────────────────────────────────────

describe('Refresh Token Expiry Parsing', () => {
  function parseExpiry(str: string): Date {
    const result = new Date();
    let hasMatch = false;
    const regex = /(\d+)([wdhms])/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      hasMatch = true;
      const value = parseInt(match[1] ?? '0', 10);
      const unit = match[2];
      if (unit === 'w') {
        result.setDate(result.getDate() + value * 7);
      } else if (unit === 'd') {
        result.setDate(result.getDate() + value);
      } else if (unit === 'h') {
        result.setHours(result.getHours() + value);
      } else if (unit === 'm') {
        result.setMinutes(result.getMinutes() + value);
      } else if (unit === 's') {
        result.setSeconds(result.getSeconds() + value);
      }
    }
    if (!hasMatch) {
      result.setDate(result.getDate() + 7);
    }
    return result;
  }

  it('should parse 7d to 7 days from now', () => {
    const now = new Date();
    const result = parseExpiry('7d');
    const diffDays = Math.round((result.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(7);
  });

  it('should parse 30d to 30 days from now', () => {
    const now = new Date();
    const result = parseExpiry('30d');
    const diffDays = Math.round((result.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it('should parse 1h to 1 hour from now', () => {
    const now = new Date();
    const result = parseExpiry('1h');
    const diffHours = Math.round((result.getTime() - now.getTime()) / (1000 * 60 * 60));
    expect(diffHours).toBe(1);
  });

  it('should parse 2w to 14 days from now', () => {
    const now = new Date();
    const result = parseExpiry('2w');
    const diffDays = Math.round((result.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(14);
  });

  it('should parse compound format 2w 1d 5h from now', () => {
    const now = new Date();
    const result = parseExpiry('2w 1d 5h');
    const diffHours = Math.round((result.getTime() - now.getTime()) / (1000 * 60 * 60));
    // 14 days + 1 day = 15 days = 360 hours + 5 hours = 365 hours
    expect(diffHours).toBe(365);
  });
});

// ─────────────────────────────────────────────
// Tests — Error Classes
// ─────────────────────────────────────────────

describe('AppError Classes', () => {
  it('all error subclasses should have correct statusCode and code', () => {
    const cases = [
      { err: new NotFoundError(), status: 404, code: 'NOT_FOUND' },
      { err: new UnauthorizedError(), status: 401, code: 'UNAUTHORIZED' },
      { err: new ForbiddenError(), status: 403, code: 'FORBIDDEN' },
      { err: new ConflictError(), status: 409, code: 'CONFLICT' },
      { err: new BadRequestError(), status: 400, code: 'BAD_REQUEST' },
      { err: new ValidationError(), status: 422, code: 'VALIDATION_ERROR' },
      { err: new TooManyRequestsError(), status: 429, code: 'TOO_MANY_REQUESTS' },
      { err: new ServiceUnavailableError(), status: 503, code: 'SERVICE_UNAVAILABLE' },
    ];

    for (const { err, status, code } of cases) {
      expect(err.statusCode).toBe(status);
      expect(err.code).toBe(code);
      expect(err.isOperational).toBe(true);
    }
  });

  it('should include custom message', () => {
    const err = new NotFoundError('User with ID abc not found');
    expect(err.message).toBe('User with ID abc not found');
  });
});
