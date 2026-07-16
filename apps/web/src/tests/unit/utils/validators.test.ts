import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  loginSchema,
  resetPasswordSchema,
  changePasswordSchema,
  otpSchema,
  phoneSchema,
  nameSchema,
} from '@/utils/validators';

// ──────────────────────────────────────────────────────────
// emailSchema
// ──────────────────────────────────────────────────────────

describe('emailSchema', () => {
  it('accepts a valid email', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(emailSchema.safeParse('').success).toBe(false);
  });

  it('rejects a non-email string', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
  });

  it('lowercases the email', () => {
    const result = emailSchema.safeParse('USER@EXAMPLE.COM');
    expect(result.success && result.data).toBe('user@example.com');
  });
});

// ──────────────────────────────────────────────────────────
// passwordSchema
// ──────────────────────────────────────────────────────────

describe('passwordSchema', () => {
  it('accepts a strong password', () => {
    expect(passwordSchema.safeParse('StrongP4ss').success).toBe(true);
  });

  it('rejects a password shorter than 8 chars', () => {
    expect(passwordSchema.safeParse('Sh0rt').success).toBe(false);
  });

  it('rejects a password with no uppercase letter', () => {
    expect(passwordSchema.safeParse('weakpass1').success).toBe(false);
  });

  it('rejects a password with no lowercase letter', () => {
    expect(passwordSchema.safeParse('UPPERCASE1').success).toBe(false);
  });

  it('rejects a password with no number', () => {
    expect(passwordSchema.safeParse('NoNumber!').success).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────
// loginSchema
// ──────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid login credentials', () => {
    const result = loginSchema.safeParse({
      email: 'admin@test.com',
      password: 'anypassword',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({ email: 'admin@test.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'bad', password: 'pass' });
    expect(result.success).toBe(false);
  });

  it('defaults rememberMe to false', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'secret' });
    expect(result.success && result.data.rememberMe).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────
// resetPasswordSchema
// ──────────────────────────────────────────────────────────

describe('resetPasswordSchema', () => {
  const validPayload = {
    token: 'reset-token-123',
    password: 'NewPass123',
    confirmPassword: 'NewPass123',
  };

  it('accepts matching strong passwords', () => {
    expect(resetPasswordSchema.safeParse(validPayload).success).toBe(true);
  });

  it('rejects when passwords do not match', () => {
    const result = resetPasswordSchema.safeParse({
      ...validPayload,
      confirmPassword: 'DifferentP4ss',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing token', () => {
    const result = resetPasswordSchema.safeParse({ ...validPayload, token: '' });
    expect(result.success).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────
// changePasswordSchema
// ──────────────────────────────────────────────────────────

describe('changePasswordSchema', () => {
  const validPayload = {
    currentPassword: 'OldPass1',
    newPassword: 'NewPass123',
    confirmPassword: 'NewPass123',
  };

  it('accepts valid change password input', () => {
    expect(changePasswordSchema.safeParse(validPayload).success).toBe(true);
  });

  it('rejects when new password matches current password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'SamePass1',
      newPassword: 'SamePass1',
      confirmPassword: 'SamePass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects when confirmPassword does not match newPassword', () => {
    const result = changePasswordSchema.safeParse({
      ...validPayload,
      confirmPassword: 'Mismatch9',
    });
    expect(result.success).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────
// otpSchema
// ──────────────────────────────────────────────────────────

describe('otpSchema', () => {
  it('accepts a 6-digit code', () => {
    expect(otpSchema.safeParse('123456').success).toBe(true);
  });

  it('rejects a 5-digit code', () => {
    expect(otpSchema.safeParse('12345').success).toBe(false);
  });

  it('rejects non-numeric characters', () => {
    expect(otpSchema.safeParse('12345a').success).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────
// phoneSchema
// ──────────────────────────────────────────────────────────

describe('phoneSchema', () => {
  it('accepts a valid phone number', () => {
    expect(phoneSchema.safeParse('+1 800 555-1234').success).toBe(true);
  });

  it('accepts an empty string (optional)', () => {
    expect(phoneSchema.safeParse('').success).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────
// nameSchema
// ──────────────────────────────────────────────────────────

describe('nameSchema', () => {
  it('accepts a valid name', () => {
    expect(nameSchema.safeParse('John Doe').success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(nameSchema.safeParse('').success).toBe(false);
  });

  it('rejects a name exceeding 100 chars', () => {
    expect(nameSchema.safeParse('a'.repeat(101)).success).toBe(false);
  });
});
