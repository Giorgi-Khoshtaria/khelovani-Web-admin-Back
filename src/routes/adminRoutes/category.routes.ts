import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryPin,
} from "../../controllers/admin/category/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import {
  categorySchema,
  updateCategorySchema,
} from "../../validations/schemas/product/category.schema.js";
import { commonParamsSchema } from "../../validations/schemas/shared/common.schema.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_VIEW_ALL),
  getCategories,
);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_VIEW_ALL),
  validate(commonParamsSchema),
  getCategoryById,
);
router.post(
  "/",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.CATEGORY_CREATE),
  validate(categorySchema),
  createCategory,
);
router.put(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.CATEGORY_EDIT),
  validate(updateCategorySchema),
  updateCategory,
);
router.delete(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.CATEGORY_DELETE),
  validate(commonParamsSchema),
  deleteCategory,
);
router.patch(
  "/:id/pin",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.CATEGORY_PIN),
  validate(commonParamsSchema),
  updateCategoryPin,
);

export default router;
