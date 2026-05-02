import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  bulkDeleteUsers,
} from "../../controllers/admin/users/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { validate } from "../../middleware/validate.js";
import { commonParamsSchema } from "../../validations/schemas/shared/common.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ADMIN.USER_LIST), getAllUsers);
router.post(
  "/bulk-delete",
  requirePermission(PERMISSIONS.ADMIN.USER_DELETE),
  bulkDeleteUsers,
);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.USER_LIST),
  validate(commonParamsSchema),
  getUserById,
);
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.USER_DELETE),
  validate(commonParamsSchema),
  deleteUser,
);

export default router;
