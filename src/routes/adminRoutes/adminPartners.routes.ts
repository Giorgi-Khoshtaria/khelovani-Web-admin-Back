import { Router } from "express";
import {
  getAllPartners,
  getPartnerById,
  updatePartnerStatus,
  updatePartner,
  deletePartner,
  updatePartnerPhoto,
} from "../../controllers/partners/getPartner.controller.js";
import upload from "../../utils/config/multer.js";
import { authenticate } from "../../middleware/auth/authenticate.js";

import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { CloudinaryFolder } from "../../types/cloudinaryFolder.enum.js";

const router = Router();

// ✅ Admin Partner management routes
router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ADMIN.USER_LIST), getAllPartners);
router.get("/:id", getPartnerById); // Access check handled in controller
router.patch(
  "/:id/status",
  twoMinutesLimiter,
  requirePermission(
    PERMISSIONS.ADMIN.ORG_APPROVE,
    PERMISSIONS.ADMIN.ORG_REJECT,
  ),
  updatePartnerStatus,
);
router.patch("/:id", twoMinutesLimiter, updatePartner); // Access check handled in controller
router.patch(
  "/:id/photo",
  twoMinutesLimiter,
  (req: any, res, next) => {
    req.cloudinaryFolder = CloudinaryFolder.Organizations;
    next();
  },
  upload.single("image"),
  updatePartnerPhoto,
);
router.delete("/:id", twoMinutesLimiter, deletePartner); // Access check handled in controller

export default router;
