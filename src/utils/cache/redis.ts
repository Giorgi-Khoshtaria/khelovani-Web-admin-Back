import { Redis } from "ioredis";
import type { Redis as RedisType } from "ioredis";

/**
 * Redis client. Uses REDIS_URL env var; if absent, exports a no-op so the
 * server still runs (useful for local dev without Redis).
 */
let client: RedisType | null = null;
let initialized = false;

export const getRedis = (): RedisType | null => {
  if (initialized) return client;
  initialized = true;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn(
      "[redis] REDIS_URL not set — cache disabled, all reads hit DB.",
    );
    return null;
  }

  try {
    client = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    client.on("error", (err: Error) => {
      console.error("[redis] connection error:", err.message);
    });
    client.on("ready", () => {
      console.log("[redis] connected and ready");
    });
  } catch (err) {
    console.error("[redis] failed to construct client:", err);
    client = null;
  }

  return client;
};

/**
 * Read-through cache. Returns cached JSON if present, otherwise runs
 * `fetcher`, stores the result with TTL, and returns it. Cache failures
 * are swallowed — a Redis outage must never break a request.
 */
export const getOrSet = async <T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> => {
  const redis = getRedis();
  if (!redis) return fetcher();

  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`[redis] cache hit: ${key}`);
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.warn(`[redis] get failed for ${key}:`, (err as Error).message);
  }

  const fresh = await fetcher();

  try {
    await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
  } catch (err) {
    console.warn(`[redis] set failed for ${key}:`, (err as Error).message);
  }

  return fresh;
};

/** Delete a single key. */
export const invalidate = async (key: string): Promise<void> => {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.warn(`[redis] del failed for ${key}:`, (err as Error).message);
  }
};

/**
 * Delete every key matching a glob pattern. Used to invalidate paginated
 * listings (e.g. `products:list:*`) after a write.
 *
 * SCAN-based — safe on large keyspaces, doesn't block Redis.
 */
export const invalidatePattern = async (pattern: string): Promise<void> => {
  const redis = getRedis();
  if (!redis) return;
  try {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    const pipeline = redis.pipeline();
    let count = 0;
    for await (const keys of stream) {
      for (const key of keys as string[]) {
        pipeline.del(key);
        count++;
      }
    }
    if (count > 0) await pipeline.exec();
  } catch (err) {
    console.warn(
      `[redis] invalidatePattern failed for ${pattern}:`,
      (err as Error).message,
    );
  }
};
