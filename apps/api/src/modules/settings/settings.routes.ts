import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import { handleGetSettings, handleUpsertSetting, handleDeleteSetting } from './settings.controller';

/**
 * Route definitions for /companies/:companyId/settings endpoints.
 * Registered nested under the company routes prefix.
 */
export async function settingsRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  // GET /companies/:companyId/settings
  fastify.get(
    '/:companyId/settings',
    {
      preHandler: [authGuard, permissionGuard('settings.read')],
      schema: { tags: ['Settings'], summary: 'List all settings for a company' },
    },
    handleGetSettings,
  );

  // PUT /companies/:companyId/settings/:key
  fastify.put(
    '/:companyId/settings/:key',
    {
      preHandler: [authGuard, permissionGuard('settings.update')],
      schema: { tags: ['Settings'], summary: 'Create or update a business setting' },
    },
    handleUpsertSetting,
  );

  // DELETE /companies/:companyId/settings/:key
  fastify.delete(
    '/:companyId/settings/:key',
    {
      preHandler: [authGuard, permissionGuard('settings.delete')],
      schema: { tags: ['Settings'], summary: 'Delete a business setting' },
    },
    handleDeleteSetting,
  );
}

export default settingsRoutes;
