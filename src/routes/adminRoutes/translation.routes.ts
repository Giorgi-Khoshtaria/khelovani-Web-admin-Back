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

const router = Router();

// ✅ Public Routes (needed by frontend to load translations before login)
router.get("/", getTranslations);
router.get("/namespaces", getNamespaces);

// 🔒 Protected Routes (Admin only to manage translations)
router.post("/", authenticate, addTranslation);
router.post("/bulk", authenticate, bulkTranslation);
router.post("/bulk-delete", authenticate, bulkDeleteTranslations);
router.put("/:id", authenticate, updateTranslation);
router.delete("/:id", authenticate, deleteTranslation);

export default router;
