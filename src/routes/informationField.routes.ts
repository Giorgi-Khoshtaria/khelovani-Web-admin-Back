import { Router } from "express";
import { getPublicInformationFields } from "../controllers/informationField/index.js";
import { cacheRoute } from "../middleware/cache.js";
import { CacheKey, CacheTTL } from "../utils/cache/keys.js";

const router = Router();

// ✅ Public read of site information fields (email, phone, address, …)
router.get(
  "/",
  cacheRoute(() => CacheKey.informationFields(), CacheTTL.informationFields),
  getPublicInformationFields,
);

export default router;
