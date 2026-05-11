import { invalidatePattern } from "./redis.js";
import { CacheKey } from "./keys.js";

/**
 * Domain-level cache invalidators. Call these from write controllers
 * after a successful mutation. Pattern-based: wipes every paginated
 * variant in one shot.
 *
 * All are fire-and-forget by design — Redis being slow/down must never
 * block the response. Errors are logged inside `invalidatePattern`.
 */
export const invalidateTranslations = () =>
  invalidatePattern(CacheKey.translationsPattern());

export const invalidateCategories = () =>
  invalidatePattern(CacheKey.categoriesPattern());

export const invalidateMenu = () => invalidatePattern(CacheKey.menuPattern());

export const invalidateProducts = () =>
  invalidatePattern(CacheKey.productsPattern());

export const invalidatePartners = () =>
  invalidatePattern(CacheKey.partnersPattern());
