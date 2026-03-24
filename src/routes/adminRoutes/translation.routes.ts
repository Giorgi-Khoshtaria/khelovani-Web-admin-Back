import { Router } from "express";
import {
  getTranslations,
  getNamespaces,
  addTranslation,
  updateTranslation,
  deleteTranslation,
} from "../../controllers/admin/translation/translation.controller.js";
import {
  bulkTranslation,
  bulkDeleteTranslations,
} from "../../controllers/admin/translation/bulkTranslation.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.js";

import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";

const router = Router();

// ✅ Public Routes (needed by frontend to load translations before login)
router.get("/", getTranslations);
router.get("/namespaces", getNamespaces);

// 🔒 Protected Routes (Admin only to manage translations)
router.post("/", authenticate, requirePermission(PERMISSIONS.TRANSLATIONS.EDIT), addTranslation);
router.post("/bulk", authenticate, requirePermission(PERMISSIONS.TRANSLATIONS.EDIT), bulkTranslation);
router.post("/bulk-delete", authenticate, requirePermission(PERMISSIONS.TRANSLATIONS.DELETE), bulkDeleteTranslations);
router.put("/:id", authenticate, requirePermission(PERMISSIONS.TRANSLATIONS.EDIT), updateTranslation);
router.delete("/:id", authenticate, requirePermission(PERMISSIONS.TRANSLATIONS.DELETE), deleteTranslation);

export default router;
