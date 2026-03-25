import { Router } from "express";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../controllers/admin/menu/menu.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";

const router = Router();

router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ADMIN.MENU_MANAGE), getMenuItems);
router.post("/", requirePermission(PERMISSIONS.ADMIN.MENU_MANAGE), createMenuItem);
router.put("/:id", requirePermission(PERMISSIONS.ADMIN.MENU_MANAGE), updateMenuItem);
router.delete("/:id", requirePermission(PERMISSIONS.ADMIN.MENU_MANAGE), deleteMenuItem);

export default router;
