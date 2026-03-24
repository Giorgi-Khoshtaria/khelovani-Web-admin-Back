import { Router } from "express";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../../controllers/admin/role/role.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";

import { PERMISSIONS } from "../../middleware/role/permissions.js";

const router = Router();

// Protect all role routes with authentication
router.use(authenticate);

// Role CRUD
router.get("/", requirePermission(PERMISSIONS.ROLES.READ), getRoles);
router.get("/:id", requirePermission(PERMISSIONS.ROLES.READ), getRoleById);
router.post("/", requirePermission(PERMISSIONS.ROLES.CREATE), createRole);
router.put("/:id", requirePermission(PERMISSIONS.ROLES.EDIT), updateRole);
router.delete("/:id", requirePermission(PERMISSIONS.ROLES.DELETE), deleteRole);

export default router;
