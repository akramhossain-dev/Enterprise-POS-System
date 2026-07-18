import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../lib/prisma';
import { EmployeeStatus } from '@prisma/client';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery, validateParams } from '../../common/utils/validate';
import { BadRequestError, NotFoundError } from '../../common/errors/AppError';
import {
  settingsQuerySchema,
  upsertSettingSchema,
  settingParamsSchema,
  SettingsQuery,
  SettingParams,
  CategoryEnum,
} from './settings.schema';
import {
  getSettings,
  upsertSetting,
  deleteSetting,
  getAllSystemSettings,
  getSystemSettingByCategory,
  saveSystemSettingCategory,
  patchSystemSettingCategory,
} from './settings.service';

// ── Backward Compatible Handlers ──

export async function handleGetSettings(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { companyId } = validateParams(
    settingParamsSchema.pick({ companyId: true }),
    request.params,
  ) as Pick<SettingParams, 'companyId'>;
  const query = validateQuery(settingsQuerySchema, request.query);
  const result = await getSettings(companyId, query);
  reply.status(200).send(
    sendSuccess({
      message: 'Settings fetched successfully',
      data: result.settings,
      meta: result.meta,
    }),
  );
}

export async function handleUpsertSetting(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { companyId, key } = validateParams(settingParamsSchema, request.params);
  const body = validateBody(upsertSettingSchema, request.body);
  const setting = await upsertSetting(companyId, key, body);
  reply.status(200).send(sendSuccess({ message: 'Setting saved successfully', data: setting }));
}

export async function handleDeleteSetting(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { companyId, key } = validateParams(settingParamsSchema, request.params);
  await deleteSetting(companyId, key);
  reply.status(200).send(sendSuccess({ message: 'Setting deleted successfully' }));
}

// ── B12.3 Centralized SystemSettings Handlers ──

async function getActorCompanyId(userId: string): Promise<string> {
  const employee = await prisma.employee.findFirst({
    where: { userId, status: { not: EmployeeStatus.TERMINATED } },
  });
  if (!employee) {
    throw new NotFoundError('Associated employee record not found');
  }
  return employee.companyId;
}

export async function handleGetSystemSettings(request: FastifyRequest, reply: FastifyReply) {
  const actor = request.user as { id: string };
  const companyId = await getActorCompanyId(actor.id);

  const data = await getAllSystemSettings(companyId);
  reply
    .status(200)
    .send(sendSuccess({ message: 'All system settings fetched successfully', data }));
}

export async function handleGetSystemSettingsByCategory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const actor = request.user as { id: string };
  const companyId = await getActorCompanyId(actor.id);
  const { category } = request.params as { category: string };

  const parsedCategory = CategoryEnum.safeParse(category);
  if (!parsedCategory.success) {
    throw new BadRequestError(`Invalid settings category: "${category}"`);
  }

  const data = (await getSystemSettingByCategory(companyId, parsedCategory.data, true)) ?? {};
  reply.status(200).send(
    sendSuccess({
      message: `Settings for category ${category} fetched successfully`,
      data,
    }),
  );
}

export async function handlePutSystemSettingsByCategory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const actor = request.user as { id: string };
  const companyId = await getActorCompanyId(actor.id);
  const { category } = request.params as { category: string };

  const parsedCategory = CategoryEnum.safeParse(category);
  if (!parsedCategory.success) {
    throw new BadRequestError(`Invalid settings category: "${category}"`);
  }

  const payload = request.body;
  const data = await saveSystemSettingCategory(companyId, parsedCategory.data, payload, actor.id);

  reply.status(200).send(
    sendSuccess({
      message: `Settings for category ${category} updated successfully`,
      data,
    }),
  );
}

export async function handlePatchSystemSettingsByCategory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const actor = request.user as { id: string };
  const companyId = await getActorCompanyId(actor.id);
  const { category } = request.params as { category: string };

  const parsedCategory = CategoryEnum.safeParse(category);
  if (!parsedCategory.success) {
    throw new BadRequestError(`Invalid settings category: "${category}"`);
  }

  const payload = request.body;
  const data = await patchSystemSettingCategory(companyId, parsedCategory.data, payload, actor.id);

  reply.status(200).send(
    sendSuccess({
      message: `Settings for category ${category} patched successfully`,
      data,
    }),
  );
}
