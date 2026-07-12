import { prisma } from '../../lib/prisma';
import { NotificationType, NotificationChannel } from '@prisma/client';

export async function getUserPreferences(userId: string) {
  const preferences = await prisma.notificationPreference.findMany({
    where: { userId },
  });

  // Build a complete list matching all NotificationType enums
  const types = Object.values(NotificationType);
  const result = [];

  for (const type of types) {
    const existing = preferences.find((p) => p.type === type);
    result.push({
      type,
      emailEnabled: existing ? existing.emailEnabled : true,
      pushEnabled: existing ? existing.pushEnabled : true,
      inAppEnabled: existing ? existing.inAppEnabled : true,
    });
  }

  return result;
}

export async function updateUserPreference(
  userId: string,
  type: NotificationType,
  updates: { emailEnabled?: boolean; pushEnabled?: boolean; inAppEnabled?: boolean },
) {
  return prisma.notificationPreference.upsert({
    where: {
      userId_type: { userId, type },
    },
    update: updates,
    create: {
      userId,
      type,
      emailEnabled: updates.emailEnabled ?? true,
      pushEnabled: updates.pushEnabled ?? true,
      inAppEnabled: updates.inAppEnabled ?? true,
    },
  });
}

export async function isChannelEnabled(
  userId: string,
  type: NotificationType,
  channel: NotificationChannel,
): Promise<boolean> {
  const pref = await prisma.notificationPreference.findUnique({
    where: {
      userId_type: { userId, type },
    },
  });

  if (!pref) {
    return true;
  }

  if (channel === 'EMAIL') {
    return pref.emailEnabled;
  }
  if (channel === 'PUSH') {
    return pref.pushEnabled;
  }

  return pref.inAppEnabled;
}
