import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import { Status, Prisma } from '@prisma/client';
import { encrypt, decrypt } from '../../common/utils/encryption';
import { redisConnection } from '../notification/queue';
import { recordAuditLog } from '../audit/audit.service';
import { SettingCategory, getCategorySchema } from './settings.schema';
import { createLogger } from '../../lib/logger';

const log = createLogger('settings-service');

// ── Keep Old BusinessSetting Mappings for Backward Compatibility ──────────

async function assertCompanyExists(companyId: string): Promise<void> {
  const company = await prisma.company.findFirst({
    where: { id: companyId, status: { not: Status.DELETED } },
    select: { id: true },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }
}

export async function getSettings(companyId: string, query: { page: number; limit: number }) {
  await assertCompanyExists(companyId);

  const skip = (query.page - 1) * query.limit;
  const take = query.limit;

  const [settings, total] = await prisma.$transaction([
    prisma.businessSetting.findMany({
      where: { companyId },
      orderBy: { key: 'asc' },
      skip,
      take,
      select: {
        id: true,
        key: true,
        value: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.businessSetting.count({ where: { companyId } }),
  ]);

  const totalPages = Math.ceil(total / query.limit);
  const meta = {
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
    hasNextPage: query.page < totalPages,
    hasPrevPage: query.page > 1,
  };

  return { settings, meta };
}

export async function upsertSetting(companyId: string, key: string, body: { value: string }) {
  await assertCompanyExists(companyId);

  const oldSetting = await prisma.businessSetting.findUnique({
    where: { companyId_key: { companyId, key } },
  });

  const res = await prisma.businessSetting.upsert({
    where: { companyId_key: { companyId, key } },
    create: { companyId, key, value: body.value },
    update: { value: body.value },
    select: { id: true, key: true, value: true, companyId: true, createdAt: true, updatedAt: true },
  });

  void Promise.resolve().then(async () => {
    try {
      await recordAuditLog({
        companyId,
        action: 'SETTINGS_CHANGE',
        entityType: 'BusinessSetting',
        entityId: res.id,
        oldValue: oldSetting ? { value: oldSetting.value } : null,
        newValue: { value: res.value },
        description: `Upserted setting: ${key}`,
      });
    } catch (err) {
      log.error({ err }, 'Failed to log setting change');
    }
  });

  return res;
}

export async function deleteSetting(companyId: string, key: string): Promise<void> {
  await assertCompanyExists(companyId);

  const setting = await prisma.businessSetting.findUnique({
    where: { companyId_key: { companyId, key } },
  });

  if (!setting) {
    throw new NotFoundError(`Setting '${key}' not found for this company`);
  }

  await prisma.businessSetting.delete({ where: { companyId_key: { companyId, key } } });
}

// ── B12.3 Centralized SystemSetting Infrastructure ───────────────────────────

const SENSITIVE_FIELDS = ['password', 'smtpPassword', 'apiSecret', 'secret'];

function encryptSensitive(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') {
    return {};
  }
  const clone = { ...(data as Record<string, unknown>) };
  for (const k of Object.keys(clone)) {
    if (SENSITIVE_FIELDS.includes(k) && typeof clone[k] === 'string' && clone[k]) {
      clone[k] = encrypt(clone[k]);
    }
  }
  return clone;
}

function decryptSensitive(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') {
    return {};
  }
  const clone = { ...(data as Record<string, unknown>) };
  for (const k of Object.keys(clone)) {
    if (SENSITIVE_FIELDS.includes(k) && typeof clone[k] === 'string' && clone[k]) {
      clone[k] = decrypt(clone[k]);
    }
  }
  return clone;
}

function maskSensitive(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') {
    return {};
  }
  const clone = { ...(data as Record<string, unknown>) };
  for (const k of Object.keys(clone)) {
    if (SENSITIVE_FIELDS.includes(k)) {
      clone[k] = '********';
    }
  }
  return clone;
}

export async function getSystemSettingByCategory(
  companyId: string,
  category: SettingCategory,
  mask = true,
): Promise<Record<string, unknown> | null> {
  await assertCompanyExists(companyId);

  // Check Redis Cache
  const cacheKey = `settings:${companyId}:${category}`;
  try {
    const cached = await redisConnection.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as unknown;
      return mask ? maskSensitive(parsed) : decryptSensitive(parsed);
    }
  } catch (err) {
    log.error(
      { err, cacheKey: `settings:${companyId}:${category}` },
      'Failed to get settings cache',
    );
  }

  const record = await prisma.systemSetting.findFirst({
    where: { companyId, category },
  });

  if (!record) {
    return null;
  }

  const valObj = record.value as Record<string, unknown>;

  // Set Cache
  try {
    await redisConnection.setex(cacheKey, 3600, JSON.stringify(valObj));
  } catch (err) {
    log.error({ err }, 'Failed to set settings cache');
  }

  return mask ? maskSensitive(valObj) : decryptSensitive(valObj);
}

export async function getAllSystemSettings(companyId: string): Promise<Record<string, unknown>> {
  await assertCompanyExists(companyId);

  const categories: SettingCategory[] = [
    'COMPANY',
    'BRANCH',
    'POS',
    'INVOICE',
    'TAX',
    'CURRENCY',
    'LOCALE',
    'EMAIL',
    'BACKUP',
    'SECURITY',
    'FEATURE',
    'SYSTEM',
    'BARCODE',
    'RECEIPT',
  ];

  const results: Record<string, unknown> = {};
  for (const cat of categories) {
    const settingsObj = await getSystemSettingByCategory(companyId, cat, true);
    if (settingsObj) {
      results[cat] = settingsObj;
    }
  }

  return results;
}

export async function saveSystemSettingCategory(
  companyId: string,
  category: SettingCategory,
  payload: unknown,
  userId: string,
): Promise<Record<string, unknown>> {
  await assertCompanyExists(companyId);

  // Validate Category Zod schema
  const schema = getCategorySchema(category);
  const validated = schema.parse(payload) as unknown;

  const key = `${category}_SETTINGS`;

  const oldVal = await getSystemSettingByCategory(companyId, category, false);

  // Encrypt sensitive elements before database save
  const encryptedPayload = encryptSensitive(validated);

  const record = await prisma.systemSetting.upsert({
    where: { companyId_key: { companyId, key } },
    create: {
      companyId,
      category,
      key,
      value: encryptedPayload as Prisma.InputJsonValue,
    },
    update: {
      value: encryptedPayload as Prisma.InputJsonValue,
    },
  });

  // Invalidate cache
  const cacheKey = `settings:${companyId}:${category}`;
  try {
    await redisConnection.del(cacheKey);
  } catch (err) {
    log.error({ err }, 'Failed to invalidate settings cache');
  }

  // Trigger Audit Log
  let actionStr = 'Settings Changed';
  if (category === 'COMPANY') {
    actionStr = 'Company Updated';
  } else if (category === 'BRANCH') {
    actionStr = 'Branch Updated';
  } else if (category === 'EMAIL') {
    actionStr = 'SMTP Updated';
  } else if (category === 'FEATURE') {
    actionStr = 'Feature Flag Changed';
  }

  await recordAuditLog({
    companyId,
    userId,
    action: actionStr,
    entityType: 'SystemSetting',
    entityId: record.id,
    oldValue: oldVal ? maskSensitive(oldVal) : null,
    newValue: maskSensitive(validated),
    description: `${actionStr} for category ${category}`,
  });

  return maskSensitive(validated);
}

export async function patchSystemSettingCategory(
  companyId: string,
  category: SettingCategory,
  payload: unknown,
  userId: string,
): Promise<Record<string, unknown>> {
  const current = (await getSystemSettingByCategory(companyId, category, false)) ?? {};
  const merged = { ...current, ...(payload as Record<string, unknown>) };
  return saveSystemSettingCategory(companyId, category, merged, userId);
}
