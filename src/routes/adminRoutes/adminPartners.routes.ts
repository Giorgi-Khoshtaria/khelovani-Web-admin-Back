import { Router } from "express";
import {
  getAllPartners,
  getPartnerById,
  updatePartnerStatus,
} from "../../controllers/partners/getPartner.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.js";

import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";

const router = Router();

// ✅ Admin Partner management routes
router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ORGS.READ), getAllPartners);
router.get("/:id", requirePermission(PERMISSIONS.ORGS.READ), getPartnerById);
router.patch("/:id/status", requirePermission(PERMISSIONS.ORGS.VERIFY, PERMISSIONS.ORGS.REJECT), updatePartnerStatus);

export default router;
