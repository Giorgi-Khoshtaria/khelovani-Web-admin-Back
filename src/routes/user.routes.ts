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
import { authenticate } from "../utils/middleware/auth-middleware/authenticate.js";
import { requirePermission } from "../utils/middleware/role-middleware/requirePermission.js";
import { requirePanel } from "../utils/middleware/role-middleware/requirePanel.js";
import {
  PERMISSIONS,
  PANELS,
} from "../utils/middleware/role-middleware/permition.js";
import { verifyEmailCallback } from "../utils/middleware/verification-middleware/emailVerification/sendUserEmails/Verifyemailcallback.js";

const router = Router();

// ✅ Public
router.post("/register", twoMinutesLimiter, registerUser);
router.post("/login", twoMinutesLimiter, loginUser);

router.get("/verify-user-registration", verifyEmailCallback);

// ✅ Protected
// router.get("/profile", authenticate, getProfile);

// ✅ Protected + permission
// router.get("/", authenticate, requirePanel(PANELS.ADMIN), requirePermission(PERMISSIONS.USERS.READ), getAllUsers);
// router.delete("/:id", authenticate, requirePanel(PANELS.ADMIN), requirePermission(PERMISSIONS.USERS.DELETE), deleteUser);

export default router;
