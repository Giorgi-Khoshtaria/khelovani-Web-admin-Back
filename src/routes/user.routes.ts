import { Router } from "express";
import { registerUser } from "../controllers/user/registration.controller.js";
import { loginUser } from "../controllers/user/login.controller.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/user/forgot-password.controller.js";
import {
  twoMinutesLimiter,
  oneHourLimiter,
} from "../utils/limiters/rate-limit.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { requirePermission } from "../middleware/role/requirePermission.js";
import { requirePanel } from "../middleware/role/requirePanel.js";
import {
  PERMISSIONS,
  PANELS,
} from "../middleware/role/permissions.js";
import { verifyEmailCallback } from "../controllers/verification/verifyEmail.controller.js";

const router = Router();

// ✅ Public
router.post("/register", twoMinutesLimiter, registerUser);
router.post("/login", twoMinutesLimiter, loginUser);
router.post("/forgot-password", twoMinutesLimiter, forgotPassword);
router.post("/reset-password", twoMinutesLimiter, resetPassword);

router.get("/verify", verifyEmailCallback);

// ✅ Protected
// router.get("/profile", authenticate, getProfile);

// ✅ Protected + permission
// router.get("/", authenticate, requirePanel(PANELS.ADMIN), requirePermission(PERMISSIONS.USERS.READ), getAllUsers);
// router.delete("/:id", authenticate, requirePanel(PANELS.ADMIN), requirePermission(PERMISSIONS.USERS.DELETE), deleteUser);

export default router;
