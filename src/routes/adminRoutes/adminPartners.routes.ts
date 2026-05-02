import { Router } from "express";
import {
  getAllPartners,
  getPartnerById,
  updatePartnerStatus,
  updatePartner,
  bulkDeletePartners,
  deletePartner,
  updatePartnerPhoto,
  updatePartnerPin,
  updatePartnerVisibility,
} from "../../controllers/partners/index.js";
import upload from "../../utils/config/multer.js";
import { authenticate } from "../../middleware/auth/authenticate.js";

import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { CloudinaryFolder } from "../../types/cloudinaryFolder.enum.js";
import { validate } from "../../middleware/validate.js";
import { orgSchema } from "../../validations/schemas/partner/partnerAuth.schema.js";
import {
  statusUpdateSchema,
  bulkDeletePartnersSchema,
  pinPartnerSchema,
  visibilityPartnerSchema,
} from "../../validations/schemas/admin/adminPartners.schema.js";
import { commonParamsSchema } from "../../validations/schemas/shared/common.schema.js";

const router = Router();

// ✅ Admin Partner management routes
router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ADMIN.USER_LIST), getAllPartners);
router.get(
  "/:id",
  requirePermission(
    PERMISSIONS.ADMIN.USER_LIST,
    PERMISSIONS.PARTNER.PROFILE_EDIT,
  ),
  validate(commonParamsSchema),
  getPartnerById,
); // Access check also handled in controller
router.patch(
  "/:id/status",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.ORG_APPROVE),
  validate(commonParamsSchema),
  validate(statusUpdateSchema),
  updatePartnerStatus,
);
router.patch(
  "/:id",
  twoMinutesLimiter,
  requirePermission(
    PERMISSIONS.ADMIN.USER_LIST,
    PERMISSIONS.PARTNER.PROFILE_EDIT,
  ),
  validate(commonParamsSchema),
  validate(orgSchema),
  updatePartner,
); // Access check also handled in controller
router.patch(
  "/:id/photo",
  twoMinutesLimiter,
  requirePermission(
    PERMISSIONS.ADMIN.USER_LIST,
    PERMISSIONS.PARTNER.PROFILE_EDIT,
  ),
  (req: any, res, next) => {
    req.cloudinaryFolder = CloudinaryFolder.Organizations;
    next();
  },
  upload.single("image"),
  validate(commonParamsSchema),
  updatePartnerPhoto,
);
router.patch(
  "/:id/pin",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.ORG_PIN),
  validate(commonParamsSchema),
  validate(pinPartnerSchema),
  updatePartnerPin,
);
router.patch(
  "/:id/visibility",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.ORG_VISIBILITY),
  validate(commonParamsSchema),
  validate(visibilityPartnerSchema),
  updatePartnerVisibility,
);
router.post(
  "/bulk-delete",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.ORG_DELETE),
  validate(bulkDeletePartnersSchema),
  bulkDeletePartners,
);
router.delete(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.ORG_DELETE),
  validate(commonParamsSchema),
  deletePartner,
); // Access check also handled in controller

export default router;
