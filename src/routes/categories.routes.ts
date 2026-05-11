import { Router } from "express";
import { getPublicCategories } from "../controllers/public/getPublicCategories.js";
import { getPinnedCategories } from "../controllers/public/getPinnedCategories.js";
import { cacheRoute } from "../middleware/cache.js";
import { CacheKey, CacheTTL } from "../utils/cache/keys.js";

const router = Router();

router.get(
  "/",
  cacheRoute(() => CacheKey.publicCategories(), CacheTTL.categories),
  getPublicCategories,
);
router.get(
  "/pinned",
  cacheRoute(() => CacheKey.pinnedCategories(), CacheTTL.categories),
  getPinnedCategories,
);

export default router;
