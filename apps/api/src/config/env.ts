import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ─────────────────────────────────────────────
// Environment Schema
// ─────────────────────────────────────────────

const envSchema = z.object({
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
