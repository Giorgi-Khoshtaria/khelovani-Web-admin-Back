import { Router } from "express";
import {
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from "../../controllers/admin/permission/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import { permissionSchema, updatePermissionSchema } from "../../validations/schemas/permission.schema.js";
import { commonParamsSchema } from "../../validations/schemas/common.schema.js";

const router = Router();

// Protect all permission routes with authentication
router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ADMIN.ROLE_READ), getPermissions);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.ROLE_READ),
  validate(commonParamsSchema),
  getPermissionById,
);
router.post(
  "/",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.ROLE_ASSIGN),
  validate(permissionSchema),
  createPermission,
);
router.put(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.ROLE_ASSIGN),
  validate(updatePermissionSchema),
  updatePermission,
);
router.delete(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.ROLE_ASSIGN),
  validate(commonParamsSchema),
  deletePermission,
);

export default router;
