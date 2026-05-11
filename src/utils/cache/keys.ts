/**
 * Cache key registry — single source of truth for Redis keys across
 * the API. Bump VERSION to force a full cache miss after incompatible
 * shape changes.
 *
 * Convention: `{namespace}:{discriminator}:v{n}`
 *
 * Listings that depend on query params encode them in the key. Patterns
 * (with `*`) are used by `invalidatePattern` to wipe whole namespaces
 * after a write.
 */

const V = "v1";

const stable = (input: unknown) => {
  if (input === null || input === undefined) return "";
  if (typeof input === "string" || typeof input === "number") return String(input);
  return JSON.stringify(input);
};

export const CacheKey = {
  // Translations
  translations: () => `translations:${V}`,
  translationsPattern: () => `translations:*`,

  // Categories
  publicCategories: () => `categories:public:${V}`,
  pinnedCategories: () => `categories:pinned:${V}`,
  categoriesPattern: () => `categories:*`,

  // Menu
  menu: () => `menu:${V}`,
  menuPattern: () => `menu:*`,

  // Products
  productsList: (queryString: string) => `products:list:${queryString}:${V}`,
  pinnedProducts: () => `products:pinned:${V}`,
  productById: (id: string) => `products:byId:${id}:${V}`,
  productsPattern: () => `products:*`,

  // Partners
  partnersList: (queryString: string) => `partners:list:${queryString}:${V}`,
  pinnedPartners: () => `partners:pinned:${V}`,
  partnerById: (id: string) => `partners:byId:${id}:${V}`,
  partnersPattern: () => `partners:*`,

  helper: { stable },
} as const;

/** TTLs in seconds — tuned per data volatility. */
export const CacheTTL = {
  translations: 60 * 60, // 1h
  categories: 30 * 60, // 30m
  menu: 30 * 60, // 30m
  productsList: 5 * 60, // 5m
  pinnedProducts: 10 * 60, // 10m
  productById: 10 * 60, // 10m
  partnersList: 5 * 60, // 5m
  pinnedPartners: 10 * 60, // 10m
  partnerById: 10 * 60, // 10m
} as const;
