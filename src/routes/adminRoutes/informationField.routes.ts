import { Router } from "express";
import {
  getInformationFields,
  getInformationFieldById,
  createInformationField,
  updateInformationField,
  deleteInformationField,
} from "../../controllers/admin/informationField/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import {
  createInformationFieldSchema,
  updateInformationFieldSchema,
} from "../../validations/schemas/informationField.schema.js";
import { commonParamsSchema } from "../../validations/schemas/shared/common.schema.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.SETTINGS_VIEW),
  getInformationFields
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.SETTINGS_VIEW),
  validate(commonParamsSchema),
  getInformationFieldById
);

router.post(
  "/",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.SETTINGS_EDIT),
  validate(createInformationFieldSchema),
  createInformationField
);

router.put(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.SETTINGS_EDIT),
  validate({
    ...commonParamsSchema,
    ...updateInformationFieldSchema,
  }),
  updateInformationField
);

router.delete(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.SETTINGS_EDIT),
  validate(commonParamsSchema),
  deleteInformationField
);

export default router;
