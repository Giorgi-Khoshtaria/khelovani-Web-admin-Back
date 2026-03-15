import { Router } from "express";
import {
  registerUser,
  loginUser,
  // getAllUsers,
  // deleteUser,
} from "../controlers/users.controler.js";
import {
  twoMinutesLimiter,
  oneHourLimiter,
} from "../utils/limiters/rate-limit.js";
import { authenticate } from "../utils/middleware/authenticate.js";
import { requirePermission } from "../utils/middleware/requirePermission.js";
import { requirePanel } from "../utils/middleware/requirePanel.js";
import { PERMISSIONS, PANELS } from "../utils/middleware/permition.js";

const router = Router();

// ✅ Public — no auth
router.post("/register", oneHourLimiter, registerUser);
router.post("/login", twoMinutesLimiter, loginUser);

// ✅ Protected — just needs login
// router.get("/profile", authenticate, getProfile);

// ✅ Protected + permission
// router.get(
//   "/",
//   authenticate,
//   requirePanel(PANELS.ADMIN),
//   requirePermission(PERMISSIONS.USERS.READ),
//   getAllUsers,
// );

// router.delete(
//   "/:id",
//   authenticate,
//   requirePanel(PANELS.ADMIN),
//   requirePermission(PERMISSIONS.USERS.DELETE),
//   deleteUser,
// );

export default router;
