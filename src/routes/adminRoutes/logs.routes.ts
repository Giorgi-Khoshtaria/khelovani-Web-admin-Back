import { Router } from "express";
import {
  getLogs,
  getLogById,
  deleteLog,
  clearAllLogs,
} from "../../controllers/admin/logs/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { validate } from "../../middleware/validate.js";
import { commonParamsSchema } from "../../validations/schemas/shared/common.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ADMIN.LOGS_VIEW), getLogs);

router.delete("/", requirePermission(PERMISSIONS.ADMIN.LOGS_DELETE), clearAllLogs);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.LOGS_VIEW),
  validate(commonParamsSchema),
  getLogById,
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.LOGS_DELETE),
  validate(commonParamsSchema),
  deleteLog,
);

export default router;
