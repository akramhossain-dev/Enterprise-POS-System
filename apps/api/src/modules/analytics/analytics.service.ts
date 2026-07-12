import { redisConnection } from '../notification/queue';

export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300, // 5 min default
): Promise<T> {
  try {
    const cached = await redisConnection.get(key);
    if (cached !== null) {
      console.warn(`[CACHE HIT] Key: ${key}`);
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.error(`[CACHE ERROR] Failed to get cache for key ${key}:`, err);
  }

  console.warn(`[CACHE MISS] Key: ${key}. Fetching fresh data...`);
  const fresh = await fetcher();

  try {
    await redisConnection.setex(key, ttlSeconds, JSON.stringify(fresh));
  } catch (err) {
    console.error(`[CACHE ERROR] Failed to set cache for key ${key}:`, err);
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
        console.warn(`[CACHE CLEAR] Pattern: ${key}, keys deleted: ${String(keys.length)}`);
      } else {
        await redisConnection.del(key);
        console.warn(`[CACHE CLEAR] Key: ${key}`);
      }
    } else {
      await redisConnection.flushdb();
      console.warn('[CACHE CLEAR] Full Cache Purged');
    }
  } catch (err) {
    console.error('[CACHE CLEAR ERROR] Failed to clear cache:', err);
  }
}
