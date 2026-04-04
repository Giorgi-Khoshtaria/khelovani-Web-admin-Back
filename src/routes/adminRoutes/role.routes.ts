import { Router } from "express";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../../controllers/admin/role/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";

import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";

const router = Router();

// Protect all role routes with authentication
router.use(authenticate);

// Role CRUD
router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.ROLE_READ),
  twoMinutesLimiter,
  getRoles,
);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.ROLE_READ),
  twoMinutesLimiter,
  getRoleById,
);
router.post(
  "/",
  requirePermission(PERMISSIONS.ADMIN.ROLE_CREATE),
  twoMinutesLimiter,
  createRole,
);
router.put(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.ROLE_EDIT),
  twoMinutesLimiter,
  updateRole,
);
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.ROLE_DELETE),
  twoMinutesLimiter,
  deleteRole,
);

export default router;
