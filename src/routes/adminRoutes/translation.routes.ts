import { Router } from "express";
import {
  getTranslations,
  getNamespaces,
  addTranslation,
  updateTranslation,
  deleteTranslation,
  bulkTranslation,
  bulkDeleteTranslations,
} from "../../controllers/admin/translation/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";

import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import { translationSchema, bulkTranslationSchema } from "../../validations/schemas/translation.schema.js";

const router = Router();

// ✅ Public Routes (needed by frontend to load translations before login)
router.get("/", getTranslations);
router.get("/namespaces", getNamespaces);

// 🔒 Protected Routes (Admin only to manage translations)
router.post(
  "/",
  authenticate,
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.TRANSLATION_EDIT),
  validate(translationSchema),
  addTranslation,
);
router.post(
  "/bulk",
  authenticate,
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.TRANSLATION_EDIT),
  validate(bulkTranslationSchema),
  bulkTranslation,
);
router.post(
  "/bulk-delete",
  authenticate,
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.TRANSLATION_DELETE),
  bulkDeleteTranslations,
);
router.put(
  "/:id",
  authenticate,
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.TRANSLATION_EDIT),
  validate(translationSchema),
  updateTranslation,
);
router.delete(
  "/:id",
  authenticate,
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.TRANSLATION_DELETE),
  deleteTranslation,
);

export default router;
