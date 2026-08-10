import { Router } from "express";
import { getPartnerOwnReviews } from "../controllers/reviews/index.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { requirePermission } from "../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../middleware/role/permissions.js";
import { validate } from "../middleware/validate.js";
import { partnerReviewListSchema } from "../validations/schemas/review/review.schema.js";

const router = Router();

// ✅ Partner review inbox — own reviews only. There is deliberately no :id
// segment: the organisation is read from the JWT, never from the request.
router.use(authenticate);

router.get(
  "/",
  requirePermission(PERMISSIONS.PARTNER.REVIEW_VIEW),
  validate(partnerReviewListSchema),
  getPartnerOwnReviews,
);

export default router;
