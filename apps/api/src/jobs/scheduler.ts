import { lowStockQueue, expiryQueue, dailySummaryQueue } from './queues';
import { createLogger } from '../lib/logger';

const log = createLogger('scheduler');

export async function initScheduler(): Promise<void> {
  log.info('Initializing background jobs repeatability scheduler...');

  try {
    // 1. Clear any old repeatable jobs from our queues to prevent duplication
    const jobs = await dailySummaryQueue.getJobSchedulers();
    for (const job of jobs) {
      await dailySummaryQueue.removeJobScheduler(job.key);
    }
    const lowStockJobs = await lowStockQueue.getJobSchedulers();
    for (const job of lowStockJobs) {
      await lowStockQueue.removeJobScheduler(job.key);
    }
    const expiryJobs = await expiryQueue.getJobSchedulers();
    for (const job of expiryJobs) {
      await expiryQueue.removeJobScheduler(job.key);
    }

    // 2. Register Daily Tasks
    // Daily Inventory & Low Stock Scan at 00:00 (Midnight)
    await lowStockQueue.add(
      'low-stock-scan',
      {},
      {
        repeat: { pattern: '0 0 * * *' },
      },
    );

    // Daily Expiry Scan at 01:00 AM
    await expiryQueue.add(
      'expiry-scan',
      {},
      {
        repeat: { pattern: '0 1 * * *' },
      },
    );

    // Daily Sales Summary at 03:00 AM
    await dailySummaryQueue.add(
      'daily-sales-summary',
      {},
      {
        repeat: { pattern: '0 3 * * *' },
      },
    );

    // 3. Register Weekly Tasks
    // Every Sunday at 04:00 AM: Cleanup Old Sessions & Expired Tokens
    await dailySummaryQueue.add(
      'cleanup-sessions-tokens',
      {},
      {
        repeat: { pattern: '0 04 * * 0' },
      },
    );

    // 4. Register Monthly Tasks
    // 1st of every month at 05:00 AM: Archive Old Logs
    await dailySummaryQueue.add(
      'archive-old-logs',
      {},
      {
        repeat: { pattern: '0 05 1 * *' },
      },
    );

    log.info('All repeatable background jobs registered successfully.');
  } catch (err) {
    log.error({ err }, 'Failed to initialize background jobs scheduler repeatability config');
  }
}
