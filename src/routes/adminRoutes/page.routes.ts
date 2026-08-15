import { Router } from "express";
import {
  getPages,
  createPage,
  updatePage,
  deletePage,
} from "../../controllers/admin/page/index.js";
import { uploadMedia } from "../../controllers/media/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import { handleMulterError } from "../../middleware/error/handleMulterError.js";
import upload from "../../utils/config/multer.js";
import {
  pageSchema,
  updatePageSchema,
} from "../../validations/schemas/admin/page.schema.js";

const router = Router();

router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ADMIN.PAGE_MANAGE), getPages);

router.post(
  "/upload",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.PAGE_MANAGE),
  upload.single("image"),
  handleMulterError,
  uploadMedia,
);

router.post(
  "/",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.PAGE_MANAGE),
  validate(pageSchema),
  createPage,
);
router.put(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.PAGE_MANAGE),
  validate(updatePageSchema),
  updatePage,
);
router.delete(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.PAGE_MANAGE),
  deletePage,
);

export default router;
