import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  getUserPreferencesHandler,
  updateUserPreferenceHandler,
} from './notification-preference.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function notificationPreferenceRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: guard('notification.preference'),
      schema: {
        tags: ['Notification Preferences'],
        summary: 'Get user notification channel preferences',
      },
    },
    getUserPreferencesHandler,
  );

  fastify.patch(
    '/',
    {
      preHandler: guard('notification.preference'),
      schema: {
        tags: ['Notification Preferences'],
        summary: 'Update user notification channel preferences',
      },
    },
    updateUserPreferenceHandler,
  );
}
