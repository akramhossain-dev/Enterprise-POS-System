import { Queue } from 'bullmq';
import { redisConnection } from '../modules/notification/queue';

const connection = redisConnection as unknown as never;

export const emailQueue = new Queue('email-queue', { connection });
export const notificationQueue = new Queue('notification-queue', { connection });
export const lowStockQueue = new Queue('low-stock-queue', { connection });
export const expiryQueue = new Queue('expiry-queue', { connection });
export const dailySummaryQueue = new Queue('daily-summary-queue', { connection });
export const backupQueue = new Queue('backup-queue', { connection });
export const reportGenerationQueue = new Queue('report-generation-queue', { connection });
