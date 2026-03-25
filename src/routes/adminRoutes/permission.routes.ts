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

const router = Router();

// Protect all permission routes with authentication
router.use(authenticate);

router.get("/", getPermissions);
router.post("/", requirePermission(PERMISSIONS.ADMIN.ROLE_ASSIGN), createPermission);
router.put("/:id", requirePermission(PERMISSIONS.ADMIN.ROLE_ASSIGN), updatePermission);
router.delete("/:id", requirePermission(PERMISSIONS.ADMIN.ROLE_ASSIGN), deletePermission);

export default router;
