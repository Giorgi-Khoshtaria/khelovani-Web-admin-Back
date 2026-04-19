import { Router } from "express";
import upload from "../../utils/config/multer.js";
import { uploadImage } from "../../controllers/upload/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { handleMulterError } from "../../middleware/error/handleMulterError.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";

const router = Router();

router.post(
  "/",
  authenticate,
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.SETTINGS_EDIT),
  upload.single("image"),
  handleMulterError,
  uploadImage,
);

export default router;
