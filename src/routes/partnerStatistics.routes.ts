import { Router } from "express";
import { getPartnerStatistics } from "../controllers/partners/statistics/index.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { requirePermission } from "../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../middleware/role/permissions.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  requirePermission(PERMISSIONS.PARTNER.ANALYTICS_VIEW),
  getPartnerStatistics,
);

export default router;
