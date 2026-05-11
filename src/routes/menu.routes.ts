import { Router } from "express";
import { getPublicMenuItems } from "../controllers/menu/index.js";
import { cacheRoute } from "../middleware/cache.js";
import { CacheKey, CacheTTL } from "../utils/cache/keys.js";

const router = Router();

// Public — no auth needed
router.get(
  "/",
  cacheRoute(() => CacheKey.menu(), CacheTTL.menu),
  getPublicMenuItems,
);

export default router;
