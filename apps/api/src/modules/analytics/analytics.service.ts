// Analytics and Caching service layer foundation
const cacheMock = new Map<string, { value: unknown; expiresAt: number }>();

export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300, // 5 min default
): Promise<T> {
  const cached = cacheMock.get(key);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    console.warn(`[CACHE HIT] Key: ${key}`);
    return cached.value as T;
  }

  console.warn(`[CACHE MISS] Key: ${key}. Fetching fresh data...`);
  const fresh = await fetcher();

  cacheMock.set(key, {
    value: fresh,
    expiresAt: now + ttlSeconds * 1000,
  });

  return fresh;
}

export function clearCache(key?: string): void {
  if (key) {
    cacheMock.delete(key);
    console.warn(`[CACHE CLEAR] Key: ${key}`);
  } else {
    cacheMock.clear();
    console.warn('[CACHE CLEAR] Full Cache Purged');
  }
}
