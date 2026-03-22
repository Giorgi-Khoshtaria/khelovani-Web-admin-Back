import { Router } from "express";
import {
  getTranslations,
  getNamespaces,
  addTranslation,
  updateTranslation,
} from "../../controllers/admin/translation/translation.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.js";

const router = Router();

// ✅ Public Routes (needed by frontend to load translations before login)
router.get("/", getTranslations);
router.get("/namespaces", getNamespaces);

// 🔒 Protected Routes (Admin only to manage translations)
router.post("/", authenticate, addTranslation);
router.put("/:id", authenticate, updateTranslation);

export default router;
