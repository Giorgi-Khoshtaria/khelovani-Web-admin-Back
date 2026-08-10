import { Router } from "express";
import {
  getAllReviews,
  setReviewVisibility,
  deleteReview,
} from "../../controllers/reviews/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { validate } from "../../middleware/validate.js";
import { commonParamsSchema } from "../../validations/schemas/shared/common.schema.js";
import {
  adminReviewListSchema,
  reviewVisibilitySchema,
} from "../../validations/schemas/review/review.schema.js";

const router = Router();

// ✅ Admin review moderation
router.use(authenticate);

router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.REVIEW_VIEW_ALL),
  validate(adminReviewListSchema),
  getAllReviews,
);

router.patch(
  "/:id/visibility",
  requirePermission(PERMISSIONS.ADMIN.REVIEW_MODERATE),
  validate(reviewVisibilitySchema),
  setReviewVisibility,
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.REVIEW_DELETE),
  validate(commonParamsSchema),
  deleteReview,
);

export default router;
