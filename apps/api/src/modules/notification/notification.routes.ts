import { FastifyInstance } from 'fastify';
import { authGuard, permissionGuard } from '../../common/middleware/auth';
import {
  getNotificationsHandler,
  getUnreadNotificationsHandler,
  getNotificationByIdHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
  deleteNotificationHandler,
} from './notification.controller';

const guard = (p: string) => [authGuard, permissionGuard(p)];

export async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
  await Promise.resolve();

  fastify.get(
    '/',
    {
      preHandler: guard('notification.view'),
      schema: { tags: ['Notifications'], summary: 'List notifications (paginated)' },
    },
    getNotificationsHandler,
  );

  fastify.get(
    '/unread',
    {
      preHandler: guard('notification.view'),
      schema: { tags: ['Notifications'], summary: 'List unread notifications' },
    },
    getUnreadNotificationsHandler,
  );

  fastify.get(
    '/:id',
    {
      preHandler: guard('notification.view'),
      schema: { tags: ['Notifications'], summary: 'Get notification details' },
    },
    getNotificationByIdHandler,
  );

  fastify.patch(
    '/:id/read',
    {
      preHandler: guard('notification.view'),
      schema: { tags: ['Notifications'], summary: 'Mark notification as read' },
    },
    markNotificationReadHandler,
  );

  fastify.patch(
    '/read-all',
    {
      preHandler: guard('notification.view'),
      schema: { tags: ['Notifications'], summary: 'Mark all unread notifications as read' },
    },
    markAllNotificationsReadHandler,
  );

  fastify.delete(
    '/:id',
    {
      preHandler: guard('notification.manage'),
      schema: { tags: ['Notifications'], summary: 'Delete a notification' },
    },
    deleteNotificationHandler,
  );
}
