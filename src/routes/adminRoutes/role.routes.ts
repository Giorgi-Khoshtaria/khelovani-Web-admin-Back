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

const router = Router();

// Protect all role routes with authentication
router.use(authenticate);

// Role CRUD
router.get("/", getRoles);
router.get("/:id", getRoleById);
router.post("/", requirePermission("roles:manage"), createRole);
router.put("/:id", requirePermission("roles:manage"), updateRole);
router.delete("/:id", requirePermission("roles:manage"), deleteRole);

export default router;
