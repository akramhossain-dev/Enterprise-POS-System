import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../common/errors/AppError';
import { Status } from '@prisma/client';
import { SettingsQuery, UpsertSettingBody } from './settings.schema';

/**
 * Verify company exists (not deleted).
 */
async function assertCompanyExists(companyId: string): Promise<void> {
  const company = await prisma.company.findFirst({
    where: { id: companyId, status: { not: Status.DELETED } },
    select: { id: true },
  });
  if (!company) {
    throw new NotFoundError('Company not found');
  }
}

/**
 * Get all settings for a company with pagination.
 */
export async function getSettings(companyId: string, query: SettingsQuery) {
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

/**
 * Upsert (create or update) a single business setting.
 */
export async function upsertSetting(companyId: string, key: string, body: UpsertSettingBody) {
  await assertCompanyExists(companyId);

  return prisma.businessSetting.upsert({
    where: { companyId_key: { companyId, key } },
    create: { companyId, key, value: body.value },
    update: { value: body.value },
    select: { id: true, key: true, value: true, companyId: true, createdAt: true, updatedAt: true },
  });
}

/**
 * Delete a single business setting by company + key.
 */
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
