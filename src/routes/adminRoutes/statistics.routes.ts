import { Router } from "express";
import { getAdminStatistics } from "../../controllers/admin/statistics/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.STATISTICS_VIEW),
  getAdminStatistics,
);

export default router;
