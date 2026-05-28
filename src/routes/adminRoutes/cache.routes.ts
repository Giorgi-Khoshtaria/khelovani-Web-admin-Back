import { Router } from "express";
import { clearCache } from "../../controllers/admin/cache/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";

const router = Router();

router.use(authenticate);

router.delete(
  "/",
  requirePermission(PERMISSIONS.ADMIN.SETTINGS_EDIT),
  clearCache,
);

export default router;
