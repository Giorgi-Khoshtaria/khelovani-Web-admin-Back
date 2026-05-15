import { Request, Response, NextFunction } from "express";
import { getRedis } from "../utils/cache/redis.js";

/**
 * cacheRoute(keyBuilder, ttlSeconds)
 *
 * Express middleware that caches a GET response by the key returned
 * from `keyBuilder(req)`. On HIT, replies immediately from Redis.
 * On MISS, intercepts `res.json` and stores the body before letting
 * Express send it.
 *
 * Skips caching for:
 *   - Non-GET requests
 *   - Authenticated admin requests (Authorization header or req.user /
 *     req.admin set) — admins should always see fresh data after writes.
 *
 * Usage:
 *   router.get("/", cacheRoute(() => CacheKey.menu(), CacheTTL.menu), handler)
 */
type KeyBuilder = (req: Request) => string;

export const cacheRoute = (keyBuilder: KeyBuilder, ttlSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();

    // Don't serve cached data to admin/owner-view requests — they may
    // see additional fields (e.g. unpublished products) that would
    // poison the public cache key.
    const reqAny = req as Request & { user?: unknown; admin?: unknown };
    if (req.headers.authorization || reqAny.user || reqAny.admin) return next();

    const redis = getRedis();
    if (!redis) return next();

    const key = keyBuilder(req);

    try {
      const cached = await redis.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Content-Type", "application/json");
        res.send(cached);
        return;
      }
    } catch (err) {
      console.warn(`[cache] get failed for ${key}:`, (err as Error).message);
    }

    // MISS — wrap res.json to capture the response body
    res.setHeader("X-Cache", "MISS");
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis
          .set(key, JSON.stringify(body), "EX", ttlSeconds)
          .catch((err: Error) =>
            console.warn(`[cache] set failed for ${key}:`, err.message),
          );
      }
      return originalJson(body);
    };

    next();
  };
};
