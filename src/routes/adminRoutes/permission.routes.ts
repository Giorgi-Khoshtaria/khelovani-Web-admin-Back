import { Router } from "express";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../../controllers/admin/permission/permission.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";

const router = Router();

// Protect all permission routes with authentication
router.use(authenticate);

router.get("/", getPermissions);
router.post("/", requirePermission("roles:manage"), createPermission);
router.put("/:id", requirePermission("roles:manage"), updatePermission);
router.delete("/:id", requirePermission("roles:manage"), deletePermission);

export default router;
