import { invalidate, invalidatePattern } from "./redis.js";
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

/** Full wipe — use after create/delete where list counts change. */
export const invalidateProducts = () =>
  invalidatePattern(CacheKey.productsPattern());

/** Targeted — use after a single-product edit (updates byId + list caches, not other byId caches). */
export const invalidateProductById = (id: string): void => {
  void invalidate(CacheKey.productById(id));
  void invalidatePattern("products:list:*");
  void invalidate(CacheKey.pinnedProducts());
};

/** Full wipe — use after create/delete where list counts change. */
export const invalidatePartners = () =>
  invalidatePattern(CacheKey.partnersPattern());

/** Targeted — use after a single-partner edit (updates byId + list caches, not other byId caches). */
export const invalidatePartnerById = (id: string): void => {
  void invalidate(CacheKey.partnerById(id));
  void invalidatePattern("partners:list:*");
  void invalidate(CacheKey.pinnedPartners());
};
