import { Router } from "express";
import {
  registerPartner,
  getPublicPartners,
  getPublicPartnerById,
  getPinnedPartners,
} from "../controllers/partners/index.js";
import { twoMinutesLimiter } from "../utils/limiters/rate-limit.js";
import { validate } from "../middleware/validate.js";
import { partnerRegistrationSchema } from "../validations/schemas/partner/partnerAuth.schema.js";
import { cacheRoute } from "../middleware/cache.js";
import { CacheKey, CacheTTL } from "../utils/cache/keys.js";

const router = Router();

// ✅ Public Partner routes
router.post(
  "/register",
  twoMinutesLimiter,
  validate(partnerRegistrationSchema),
  registerPartner,
);
router.get(
  "/pinned",
  twoMinutesLimiter,
  cacheRoute(() => CacheKey.pinnedPartners(), CacheTTL.pinnedPartners),
  getPinnedPartners,
);
router.get(
  "/",
  twoMinutesLimiter,
  cacheRoute(
    (req) => CacheKey.partnersList(CacheKey.helper.stable(req.query)),
    CacheTTL.partnersList,
  ),
  getPublicPartners,
);
router.get(
  "/:id",
  twoMinutesLimiter,
  cacheRoute(
    (req) => CacheKey.partnerById(req.params.id),
    CacheTTL.partnerById,
  ),
  getPublicPartnerById,
);

export default router;
