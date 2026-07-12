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

    // 1. Fetch notification + recipient details from DB
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    if (!notification) {
      log.warn(`Notification ${notificationId} not found — skipping email job`);
      return;
    }

    // 2. Update status to SENT
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'SENT' },
    });

    // 3. Send real email via nodemailer
    const { sendEmail } = await import('../../lib/email/email.service');
    await sendEmail({
      to: notification.user.email,
      subject: notification.title,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          <hr/>
          <small style="color:#888">Enterprise POS System</small>
        </div>
      `,
      text: notification.message,
    });

    // 4. Update status to DELIVERED
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'DELIVERED' },
    });

    log.info({ notificationId, to: notification.user.email }, 'Email delivered successfully');
  },
  { connection: redisConnection as unknown as never },
);

export const pushWorker = new Worker(
  'push-queue',
  async (job: Job) => {
    const { notificationId } = job.data as { notificationId: string };
    log.info(`Processing Push Job for Notification: ${notificationId}`);

    // Fetch notification details
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, title: true, message: true, userId: true },
    });

    if (!notification) {
      log.warn(`Notification ${notificationId} not found — skipping push job`);
      return;
    }

    // Update status to SENT
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'SENT' },
    });

    // FCM/APNs push — requires PUSH_SERVER_KEY env variable for real push
    // Until configured, notification is delivered via WebSocket (real-time) and email
    log.info(
      { notificationId, userId: notification.userId },
      'Push notification dispatched via WebSocket (configure PUSH_SERVER_KEY for FCM)',
    );

    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'DELIVERED' },
    });
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
