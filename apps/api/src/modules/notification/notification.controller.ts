import { FastifyReply, FastifyRequest } from 'fastify';
import { sendSuccess } from '../../common/responses/success';
import { validateQuery } from '../../common/utils/validate';
import { notificationQuerySchema } from './notification.schema';
import {
  getNotifications,
  getUnreadNotifications,
  getNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from './notification.service';

export async function getNotificationsHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(notificationQuerySchema, req.query);
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const res = await getNotifications(actor.id, page, limit);
  reply.status(200).send(
    sendSuccess({
      message: 'Notifications fetched successfully',
      data: res.items,
      meta: {
        page,
        limit,
        total: res.total,
        totalPages: Math.ceil(res.total / limit),
      },
    }),
  );
}

export async function getUnreadNotificationsHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const query = validateQuery(notificationQuerySchema, req.query);
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const res = await getUnreadNotifications(actor.id, page, limit);
  reply.status(200).send(
    sendSuccess({
      message: 'Unread notifications fetched successfully',
      data: res.items,
      meta: {
        page,
        limit,
        total: res.total,
        totalPages: Math.ceil(res.total / limit),
      },
    }),
  );
}

export async function getNotificationByIdHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const { id } = req.params as { id: string };

  const data = await getNotificationById(actor.id, id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Notification details fetched successfully', data }));
}

export async function markNotificationReadHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const { id } = req.params as { id: string };

  const data = await markNotificationRead(actor.id, id);
  reply
    .status(200)
    .send(sendSuccess({ message: 'Notification marked as read successfully', data }));
}

export async function markAllNotificationsReadHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };

  await markAllNotificationsRead(actor.id);
  reply.status(200).send(sendSuccess({ message: 'All notifications marked as read successfully' }));
}

export async function deleteNotificationHandler(req: FastifyRequest, reply: FastifyReply) {
  const actor = req.user as { id: string };
  const { id } = req.params as { id: string };

  await deleteNotification(actor.id, id);
  reply.status(200).send(sendSuccess({ message: 'Notification deleted successfully' }));
}
