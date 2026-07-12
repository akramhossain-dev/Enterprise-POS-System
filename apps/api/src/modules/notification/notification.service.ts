import { prisma } from '../../lib/prisma';
import { sendRealTimeNotification } from './socket';
import { enqueueEmailNotification, enqueuePushNotification } from './queue';
import { isChannelEnabled } from '../notification-preference/notification-preference.service';
import { renderTemplate } from '../notification-template/notification-template.service';
import { NotificationType, NotificationPriority } from '@prisma/client';
import { NotFoundError } from '../../common/errors/AppError';
import { createLogger } from '../../lib/logger';

const log = createLogger('notification-service');

import { redisConnection } from './queue';

// unread cache timeout: 5 minutes
const UNREAD_CACHE_TTL = 300;

function getUnreadCacheKey(userId: string): string {
  return `unread_count:${userId}`;
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    const redis = redisConnection;
    const cacheKey = getUnreadCacheKey(userId);
    const cached = await redis.get(cacheKey);

    if (cached !== null) {
      return parseInt(cached, 10);
    }

    const count = await prisma.notification.count({
      where: {
        userId,
        channel: 'IN_APP',
        status: { not: 'READ' },
      },
    });

    await redis.setex(cacheKey, UNREAD_CACHE_TTL, String(count));
    return count;
  } catch (err) {
    log.error({ err }, 'Redis unread count cache error');
    return prisma.notification.count({
      where: {
        userId,
        channel: 'IN_APP',
        status: { not: 'READ' },
      },
    });
  }
}

export async function invalidateUnreadCache(userId: string) {
  try {
    const redis = redisConnection;
    const cacheKey = getUnreadCacheKey(userId);
    await redis.del(cacheKey);
  } catch (err) {
    log.error({ err }, 'Redis cache invalidation error');
  }
}

export async function getNotifications(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{ items: unknown[]; total: number }> {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return { items, total };
}

export async function getUnreadNotifications(
  userId: string,
  page = 1,
  limit = 20,
): Promise<{ items: unknown[]; total: number }> {
  const skip = (page - 1) * limit;
  const where = {
    userId,
    channel: 'IN_APP' as const,
    status: { not: 'READ' as const },
  };

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { items, total };
}

export async function getNotificationById(userId: string, id: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (notification?.userId !== userId) {
    throw new NotFoundError(`Notification with ID "${id}" not found`);
  }

  return notification;
}

export async function markNotificationRead(userId: string, id: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (notification?.userId !== userId) {
    throw new NotFoundError(`Notification with ID "${id}" not found`);
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      status: 'READ',
      readAt: new Date(),
    },
  });

  await invalidateUnreadCache(userId);

  // Emit Real-Time WS Update
  sendRealTimeNotification(userId, 'notification:read', { id });

  return updated;
}

export async function markAllNotificationsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      channel: 'IN_APP',
      status: { not: 'READ' },
    },
    data: {
      status: 'READ',
      readAt: new Date(),
    },
  });

  await invalidateUnreadCache(userId);

  // Emit Real-Time WS Update
  sendRealTimeNotification(userId, 'notification:read-all', { userId });

  return result;
}

export async function deleteNotification(userId: string, id: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (notification?.userId !== userId) {
    throw new NotFoundError(`Notification with ID "${id}" not found`);
  }

  await prisma.notification.delete({
    where: { id },
  });

  await invalidateUnreadCache(userId);

  // Emit Real-Time WS Update
  sendRealTimeNotification(userId, 'notification:deleted', { id });
}

export async function triggerNotificationEvent(
  companyId: string,
  userId: string,
  type: NotificationType,
  templateName: string,
  variables: Record<string, string>,
  priority: NotificationPriority = 'NORMAL',
) {
  // Validate User exists
  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) {
    log.error(`Notification trigger failed: user ${userId} does not exist.`);
    return;
  }

  // Render content
  const { subject, body } = await renderTemplate(companyId, templateName, variables);

  // IN_APP
  const inAppEnabled = await isChannelEnabled(userId, type, 'IN_APP');
  if (inAppEnabled) {
    const notif = await prisma.notification.create({
      data: {
        companyId,
        userId,
        type,
        title: subject,
        message: body,
        priority,
        channel: 'IN_APP',
        status: 'PENDING',
      },
    });

    // Invalidate Cache
    await invalidateUnreadCache(userId);

    // Emit WS notification
    sendRealTimeNotification(userId, 'notification:created', notif);

    // Auto transition to DELIVERED for In App
    await prisma.notification.update({
      where: { id: notif.id },
      data: { status: 'DELIVERED' },
    });
  }

  // EMAIL
  const emailEnabled = await isChannelEnabled(userId, type, 'EMAIL');
  if (emailEnabled) {
    const notif = await prisma.notification.create({
      data: {
        companyId,
        userId,
        type,
        title: subject,
        message: body,
        priority,
        channel: 'EMAIL',
        status: 'PENDING',
      },
    });

    // Dispatch BullMQ Job
    await enqueueEmailNotification(notif.id, { email: userExists.email });
  }

  // PUSH
  const pushEnabled = await isChannelEnabled(userId, type, 'PUSH');
  if (pushEnabled) {
    const notif = await prisma.notification.create({
      data: {
        companyId,
        userId,
        type,
        title: subject,
        message: body,
        priority,
        channel: 'PUSH',
        status: 'PENDING',
      },
    });

    // Dispatch BullMQ Job
    await enqueuePushNotification(notif.id, { deviceToken: 'dummy-token' });
  }
}
