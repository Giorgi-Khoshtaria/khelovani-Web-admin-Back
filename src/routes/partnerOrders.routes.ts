import { Router } from "express";
import {
  getPartnerOrders,
  deliverPartnerOrder,
} from "../controllers/partners/orders/index.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { requirePermission } from "../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../middleware/role/permissions.js";
import { validate } from "../middleware/validate.js";
import { commonParamsSchema } from "../validations/schemas/shared/common.schema.js";

const router = Router();

// ✅ Partner order management — own orders only
router.use(authenticate);

router.get(
  "/",
  requirePermission(PERMISSIONS.PARTNER.ORDER_VIEW),
  getPartnerOrders,
);
router.patch(
  "/:id/deliver",
  requirePermission(PERMISSIONS.PARTNER.ORDER_UPDATE),
  validate(commonParamsSchema),
  deliverPartnerOrder,
);

export default router;
