import { Router } from "express";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../../controllers/admin/permission/permission.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";

const router = Router();

// Protect all permission routes with authentication
router.use(authenticate);

router.get("/", getPermissions);
router.post("/", twoMinutesLimiter, requirePermission(PERMISSIONS.ADMIN.ROLE_ASSIGN), createPermission);
router.put("/:id", twoMinutesLimiter, requirePermission(PERMISSIONS.ADMIN.ROLE_ASSIGN), updatePermission);
router.delete("/:id", twoMinutesLimiter, requirePermission(PERMISSIONS.ADMIN.ROLE_ASSIGN), deletePermission);

export default router;
