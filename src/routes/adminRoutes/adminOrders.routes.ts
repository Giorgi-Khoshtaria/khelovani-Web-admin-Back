import { Router } from "express";
import {
  getAllOrders,
  getOrderByIdAdmin,
} from "../../controllers/admin/orders/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { validate } from "../../middleware/validate.js";
import { commonParamsSchema } from "../../validations/schemas/shared/common.schema.js";

const router = Router();

// ✅ Admin order management — view-only
router.use(authenticate);

router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.ORDER_VIEW_ALL),
  getAllOrders,
);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.ORDER_VIEW_ALL),
  validate(commonParamsSchema),
  getOrderByIdAdmin,
);

export default router;
