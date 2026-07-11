import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateBody, validateQuery, validateParams } from '../../common/utils/validate';
import {
  settingsQuerySchema,
  upsertSettingSchema,
  settingParamsSchema,
  SettingsQuery,
  SettingParams,
} from './settings.schema';
import { getSettings, upsertSetting, deleteSetting } from './settings.service';

/**
 * GET /companies/:companyId/settings
 */
export async function handleGetSettings(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { companyId } = validateParams(
    settingParamsSchema.pick({ companyId: true }),
    request.params,
  ) as Pick<SettingParams, 'companyId'>;
  const query = validateQuery(settingsQuerySchema, request.query) as SettingsQuery;
  const result = await getSettings(companyId, query);
  reply
    .status(200)
    .send(
      sendSuccess({
        message: 'Settings fetched successfully',
        data: result.settings,
        meta: result.meta,
      }),
    );
}

/**
 * PUT /companies/:companyId/settings/:key
 */
export async function handleUpsertSetting(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { companyId, key } = validateParams(settingParamsSchema, request.params);
  const body = validateBody(upsertSettingSchema, request.body);
  const setting = await upsertSetting(companyId, key, body);
  reply.status(200).send(sendSuccess({ message: 'Setting saved successfully', data: setting }));
}

/**
 * DELETE /companies/:companyId/settings/:key
 */
export async function handleDeleteSetting(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { companyId, key } = validateParams(settingParamsSchema, request.params);
  await deleteSetting(companyId, key);
  reply.status(200).send(sendSuccess({ message: 'Setting deleted successfully' }));
}
