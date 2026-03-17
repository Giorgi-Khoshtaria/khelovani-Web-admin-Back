import { Router } from "express";
import { registerUser } from "../controlers/user-controler/registration.js";
import { loginUser } from "../controlers/user-controler/login.js";
import {
  forgotPassword,
  resetPassword,
} from "../controlers/user-controler/forgot-password.js";
import {
  twoMinutesLimiter,
  oneHourLimiter,
} from "../utils/limiters/rate-limit.js";
import { authenticate } from "../middleware/auth-middleware/authenticate.js";
import { requirePermission } from "../middleware/role-middleware/requirePermission.js";
import { requirePanel } from "../middleware/role-middleware/requirePanel.js";
import {
  PERMISSIONS,
  PANELS,
} from "../middleware/role-middleware/permition.js";
import { verifyEmailCallback } from "../middleware/verification-middleware/emailVerification/sendUserEmails/Verifyemailcallback.js";

const router = Router();

// ✅ Public
router.post("/register", twoMinutesLimiter, registerUser);
router.post("/login", twoMinutesLimiter, loginUser);
router.post("/forgot-password", twoMinutesLimiter, forgotPassword);
router.post("/reset-password", twoMinutesLimiter, resetPassword);

router.get("/verify-user-registration", verifyEmailCallback);

// ✅ Protected
// router.get("/profile", authenticate, getProfile);

// ✅ Protected + permission
// router.get("/", authenticate, requirePanel(PANELS.ADMIN), requirePermission(PERMISSIONS.USERS.READ), getAllUsers);
// router.delete("/:id", authenticate, requirePanel(PANELS.ADMIN), requirePermission(PERMISSIONS.USERS.DELETE), deleteUser);

export default router;
