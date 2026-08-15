import { Router } from "express";
import { getPublicPageByPath } from "../controllers/page/index.js";
import { cacheRoute } from "../middleware/cache.js";
import { CacheKey, CacheTTL } from "../utils/cache/keys.js";

const router = Router();

// Public — no auth needed
router.get(
  "/",
  cacheRoute((req) => CacheKey.pageByPath(req.query.path as string), CacheTTL.page),
  getPublicPageByPath,
);

export default router;
