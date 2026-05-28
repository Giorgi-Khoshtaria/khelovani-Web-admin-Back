import { Router } from "express";
import {
  listMedia,
  uploadMedia,
  deleteMedia,
  renameMedia,
  getMediaOrganizations,
} from "../../controllers/media/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { setMediaFolder } from "../../middleware/media/setMediaFolder.js";
import { handleMulterError } from "../../middleware/error/handleMulterError.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import upload from "../../utils/config/multer.js";

const router = Router();

router.use(authenticate);

// View permissions — admins and org users with media.view.
const VIEW = [PERMISSIONS.ADMIN.MEDIA_VIEW, PERMISSIONS.PARTNER.MEDIA_VIEW];
// Manage permissions — upload / delete / rename.
const MANAGE = [PERMISSIONS.ADMIN.MEDIA_MANAGE, PERMISSIONS.PARTNER.MEDIA_MANAGE];

// Org list — admin only, used to populate the org filter dropdown.
router.get(
  "/organizations",
  requirePermission(PERMISSIONS.ADMIN.MEDIA_VIEW),
  getMediaOrganizations,
);

router.get("/", requirePermission(...VIEW), listMedia);

router.post(
  "/",
  requirePermission(...MANAGE),
  twoMinutesLimiter,
  setMediaFolder,
  upload.array("images", 10),
  handleMulterError,
  uploadMedia,
);

router.put("/rename", requirePermission(...MANAGE), renameMedia);

router.delete("/", requirePermission(...MANAGE), deleteMedia);

export default router;
