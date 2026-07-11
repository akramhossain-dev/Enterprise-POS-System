import { z } from 'zod';

// ─────────────────────────────────────────────
// Query Schema
// ─────────────────────────────────────────────

export const settingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
});

export type SettingsQuery = z.infer<typeof settingsQuerySchema>;

// ─────────────────────────────────────────────
// Upsert Schema (create or update a setting)
// ─────────────────────────────────────────────

export const upsertSettingSchema = z.object({
  value: z.string().min(1, 'Setting value cannot be empty'),
});

export type UpsertSettingBody = z.infer<typeof upsertSettingSchema>;

// ─────────────────────────────────────────────
// Route Params Schema
// ─────────────────────────────────────────────

export const settingParamsSchema = z.object({
  companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
  key: z.string().min(1).max(100),
});

export type SettingParams = z.infer<typeof settingParamsSchema>;
