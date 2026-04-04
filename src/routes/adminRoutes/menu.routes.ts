import { Router } from "express";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../controllers/admin/menu/index.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";

const router = Router();

router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ADMIN.MENU_MANAGE), getMenuItems);
router.post("/", twoMinutesLimiter, requirePermission(PERMISSIONS.ADMIN.MENU_MANAGE), createMenuItem);
router.put("/:id", twoMinutesLimiter, requirePermission(PERMISSIONS.ADMIN.MENU_MANAGE), updateMenuItem);
router.delete("/:id", twoMinutesLimiter, requirePermission(PERMISSIONS.ADMIN.MENU_MANAGE), deleteMenuItem);

export default router;
