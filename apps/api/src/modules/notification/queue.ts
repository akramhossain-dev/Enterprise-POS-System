import IORedis from 'ioredis';
import { Queue, Worker, Job } from 'bullmq';
import { env } from '../../config';
import { prisma } from '../../lib/prisma';
import { createLogger } from '../../lib/logger';

const log = createLogger('notification-queue');

export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// ── Queues ───────────────────────────────────────────────────────────────────
export const emailQueue = new Queue('email-queue', {
  connection: redisConnection as unknown as never,
});
export const pushQueue = new Queue('push-queue', {
  connection: redisConnection as unknown as never,
});

// Helper to push jobs
export async function enqueueEmailNotification(notificationId: string, data: unknown) {
  await emailQueue.add(
    'send-email',
    { notificationId, data },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  );
}

export async function enqueuePushNotification(notificationId: string, data: unknown) {
  await pushQueue.add(
    'send-push',
    { notificationId, data },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  );
}

// ── Workers ──────────────────────────────────────────────────────────────────
export const emailWorker = new Worker(
  'email-queue',
  async (job: Job) => {
    const { notificationId } = job.data as { notificationId: string };
    log.info(`Processing Email Job for Notification: ${notificationId}`);

    // Update status to SENT
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'SENT' },
    });

    // Simulate sending email
    // ...

    // Update status to DELIVERED
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'DELIVERED' },
    });

    log.info(`Email delivered successfully for: ${notificationId}`);
  },
  { connection: redisConnection as unknown as never },
);

export const pushWorker = new Worker(
  'push-queue',
  async (job: Job) => {
    const { notificationId } = job.data as { notificationId: string };
    log.info(`Processing Push Job for Notification: ${notificationId}`);

    // Update status to SENT
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'SENT' },
    });

    // Simulate sending push notification
    // ...

    // Update status to DELIVERED
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'DELIVERED' },
    });

    log.info(`Push delivered successfully for: ${notificationId}`);
  },
  { connection: redisConnection as unknown as never },
);

// Worker Error Handlers
emailWorker.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    const { notificationId } = job.data as { notificationId: string };
    log.error(`Email Job ${job.id ?? 'unknown'} failed with error: ${err.message}`);

    void prisma.notification
      .update({
        where: { id: notificationId },
        data: { status: 'FAILED' },
      })
      .catch((error: unknown) => {
        log.error(error);
      });
  }
});

pushWorker.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    const { notificationId } = job.data as { notificationId: string };
    log.error(`Push Job ${job.id ?? 'unknown'} failed with error: ${err.message}`);

    void prisma.notification
      .update({
        where: { id: notificationId },
        data: { status: 'FAILED' },
      })
      .catch((error: unknown) => {
        log.error(error);
      });
  }
});

// Shutdown helper
export async function closeQueues() {
  await Promise.all([
    emailQueue.close(),
    pushQueue.close(),
    emailWorker.close(),
    pushWorker.close(),
  ]);
  await redisConnection.quit();
}
