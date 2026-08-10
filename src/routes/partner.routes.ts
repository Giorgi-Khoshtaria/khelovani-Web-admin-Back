import { Router } from "express";
import {
  registerPartner,
  getPublicPartners,
  getPublicPartnerById,
  getPinnedPartners,
  partnerForgotPassword,
  partnerResetPassword,
  contactPartner,
} from "../controllers/partners/index.js";
import {
  createReview,
  getPublicPartnerReviews,
} from "../controllers/reviews/index.js";
import { twoMinutesLimiter } from "../utils/limiters/rate-limit.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth/authenticate.js";
import { validate } from "../middleware/validate.js";
import { partnerRegistrationSchema } from "../validations/schemas/partner/partnerAuth.schema.js";
import { partnerContactSchema } from "../validations/schemas/partner/partnerContact.schema.js";
import {
  createReviewSchema,
  publicReviewListSchema,
} from "../validations/schemas/review/review.schema.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/schemas/userAuth/forgotPassword.schema.js";
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
router.post("/forgot-password", twoMinutesLimiter, validate(forgotPasswordSchema), partnerForgotPassword);
router.post("/reset-password", twoMinutesLimiter, validate(resetPasswordSchema), partnerResetPassword);
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
    (req) => CacheKey.partnerById(req.params.id as string),
    CacheTTL.partnerById,
  ),
  getPublicPartnerById,
);

// ✅ Contact artisan — authenticated user sends a message to the partner.
router.post(
  "/:id/contact",
  twoMinutesLimiter,
  authenticate,
  validate(partnerContactSchema),
  contactPartner,
);

// ✅ Public review list. `validate` runs first so the cache key is built from
// the normalised query; `cacheRoute` skips any request carrying `req.user`,
// so the logged-in `meta.myReview` branch is never cached.
router.get(
  "/:id/reviews",
  twoMinutesLimiter,
  optionalAuthenticate,
  validate(publicReviewListSchema),
  cacheRoute(
    (req) =>
      CacheKey.partnerReviews(
        req.params.id as string,
        CacheKey.helper.stable(req.query),
      ),
    CacheTTL.partnerReviews,
  ),
  getPublicPartnerReviews,
);

// ✅ Rate a partner — bare `authenticate` on purpose: `requirePermission`
// dereferences `req.user.permissions`, which end-user tokens don't carry.
// The controller verifies the caller is a real User.
router.post(
  "/:id/reviews",
  twoMinutesLimiter,
  authenticate,
  validate(createReviewSchema),
  createReview,
);

export default router;
