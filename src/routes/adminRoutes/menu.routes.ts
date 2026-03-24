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

router.get("/", requirePermission(PERMISSIONS.SETTINGS.READ), getMenuItems);
router.post("/", requirePermission(PERMISSIONS.SETTINGS.EDIT), createMenuItem);
router.put("/:id", requirePermission(PERMISSIONS.SETTINGS.EDIT), updateMenuItem);
router.delete("/:id", requirePermission(PERMISSIONS.SETTINGS.EDIT), deleteMenuItem);

export default router;
