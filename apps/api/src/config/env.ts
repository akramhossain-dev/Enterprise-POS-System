import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ─────────────────────────────────────────────
// Environment Schema
// ─────────────────────────────────────────────

const envSchema = z
  .object({
    // Application
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    APP_NAME: z.string().min(1).default('Enterprise POS API'),

    // Database
    DATABASE_URL: z
      .string()
      .url()
      .refine((url) => url.startsWith('postgresql://') || url.startsWith('postgres://'), {
        message: 'DATABASE_URL must be a valid PostgreSQL connection string',
      }),

    // Redis
    REDIS_URL: z
      .string()
      .url()
      .refine((url) => url.startsWith('redis://') || url.startsWith('rediss://'), {
        message: 'REDIS_URL must be a valid Redis connection string',
      }),

    // CORS
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),

    // Security & JWT
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
    JWT_EXPIRES_IN: z.string().min(2).default('15m'),
    REFRESH_TOKEN_SECRET: z
      .string()
      .min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters for security'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().min(2).default('7d'),

    // Email (SMTP) — optional; if not set, emails are only logged
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
    SMTP_SECURE: z
      .string()
      .transform((v) => v === 'true')
      .optional(),

    // File Storage
    STORAGE_PROVIDER: z.enum(['local', 's3', 'r2', 'minio']).default('local'),
    STORAGE_REGION: z.string().optional(),
    STORAGE_ACCESS_KEY_ID: z.string().optional(),
    STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
    STORAGE_BUCKET: z.string().optional(),
    STORAGE_PUBLIC_URL: z.string().optional(),
    STORAGE_ENDPOINT: z.string().optional(),
    STORAGE_FORCE_PATH_STYLE: z
      .string()
      .transform((v) => v === 'true')
      .optional(),

    // Metrics
    METRICS_SECRET_KEY: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && !data.METRICS_SECRET_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'METRICS_SECRET_KEY is required in production mode',
        path: ['METRICS_SECRET_KEY'],
      });
    }
  });

// ─────────────────────────────────────────────
// Validate and export
// ─────────────────────────────────────────────

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌ Invalid environment variables:\n');
  const formatted = _parsed.error.format();
  console.error(JSON.stringify(formatted, null, 2));
  console.error('\nFix the above environment variables and restart the application.');
  process.exit(1);
}

export const env = _parsed.data;

// Derived config helpers
export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
