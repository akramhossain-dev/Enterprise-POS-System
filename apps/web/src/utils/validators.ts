import { z } from 'zod';

// ============================================================
// COMMON FIELD SCHEMAS
// ============================================================

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number');

export const nameSchema = z
  .string({ required_error: 'Name is required' })
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .trim();

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

export const urlSchema = z.string().url('Please enter a valid URL').optional().or(z.literal(''));

export const uuidSchema = z.string().uuid('Invalid ID format');

export const otpSchema = z
  .string()
  .length(6, 'Code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Code must contain only digits');

// ============================================================
// AUTH FORM SCHEMAS
// ============================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export const twoFactorSchema = z.object({
  code: otpSchema,
  useBackupCode: z.boolean().optional().default(false),
});

export const backupCodeSchema = z.object({
  code: z
    .string()
    .min(8, 'Backup code must be at least 8 characters')
    .max(32, 'Invalid backup code'),
});

// ============================================================
// PROFILE FORM SCHEMAS
// ============================================================

export const updateProfileSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .trim(),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .trim(),
  phone: phoneSchema,
  bio: z.string().max(500, 'Bio must be under 500 characters').optional().or(z.literal('')),
  timezone: z.string().optional().default('UTC'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const avatarSchema = z.object({
  file: z
    .instanceof(File, { message: 'Please select an image file' })
    .refine((f) => f.size <= 5 * 1024 * 1024, 'Image must be under 5MB')
    .refine(
      (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Only JPEG, PNG, and WebP images are allowed',
    ),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AvatarInput = z.infer<typeof avatarSchema>;
