import { redisConnection } from '../notification/queue';
import { createLogger } from '../../lib/logger';

const log = createLogger('analytics-cache');

export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300, // 5 min default
): Promise<T> {
  try {
    const cached = await redisConnection.get(key);
    if (cached !== null) {
      log.debug({ key }, 'Cache hit');
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    log.error({ err, key }, 'Failed to get cache');
  }

  log.debug({ key }, 'Cache miss — fetching fresh data');
  const fresh = await fetcher();

  try {
    await redisConnection.setex(key, ttlSeconds, JSON.stringify(fresh));
  } catch (err) {
    log.error({ err, key }, 'Failed to set cache');
  }

  return fresh;
}

export async function clearCache(key?: string): Promise<void> {
  try {
    if (key) {
      if (key.includes('*')) {
        const keys = await redisConnection.keys(key);
        if (keys.length > 0) {
          await redisConnection.del(...keys);
        }
        log.info({ pattern: key, deleted: keys.length }, 'Cache pattern cleared');
      } else {
        await redisConnection.del(key);
        log.info({ key }, 'Cache key cleared');
      }
    } else {
      await redisConnection.flushdb();
      log.warn('Full cache purged (flushdb)');
    }
  } catch (err) {
    log.error({ err }, 'Failed to clear cache');
  }
}
