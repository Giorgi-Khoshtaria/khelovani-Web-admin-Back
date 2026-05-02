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
import { validate } from "../../middleware/validate.js";
import {
  roleSchema,
  updateRoleSchema,
} from "../../validations/schemas/admin/role.schema.js";
import { commonParamsSchema } from "../../validations/schemas/shared/common.schema.js";
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
  validate(commonParamsSchema),
  getRoleById,
);
router.post(
  "/",
  requirePermission(PERMISSIONS.ADMIN.ROLE_CREATE),
  twoMinutesLimiter,
  validate(roleSchema),
  createRole,
);
router.put(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.ROLE_EDIT),
  twoMinutesLimiter,
  validate(updateRoleSchema),
  updateRole,
);
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.ROLE_DELETE),
  twoMinutesLimiter,
  validate(commonParamsSchema),
  deleteRole,
);

export default router;
