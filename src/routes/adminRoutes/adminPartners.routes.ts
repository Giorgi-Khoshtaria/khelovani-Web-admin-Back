import { Router } from "express";
import {
  getAllPartners,
  getPartnerById,
  updatePartnerStatus,
  updatePartner,
  deletePartner,
} from "../../controllers/partners/getPartner.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.js";

import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";

const router = Router();

// ✅ Admin Partner management routes
router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ADMIN.USER_LIST), getAllPartners);
router.get("/:id", getPartnerById); // Access check handled in controller
router.patch("/:id/status", requirePermission(PERMISSIONS.ADMIN.ORG_APPROVE, PERMISSIONS.ADMIN.ORG_REJECT), updatePartnerStatus);
router.patch("/:id", updatePartner); // Access check handled in controller
router.delete("/:id", deletePartner); // Access check handled in controller

export default router;
