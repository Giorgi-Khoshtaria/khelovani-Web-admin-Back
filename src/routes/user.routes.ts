import { Router } from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  deleteUserByEmail,
} from "../controllers/user/index.js";
import {
  twoMinutesLimiter,
  oneHourLimiter,
} from "../utils/limiters/rate-limit.js";

import { verifyEmailCallback } from "../controllers/verification/index.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validations/schemas/login.schema.js";
import { registerSchema } from "../validations/schemas/register.schema.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/schemas/forgotPassword.schema.js";
import { emailOnlySchema } from "../validations/schemas/user.schema.js";

const router = Router();

// ✅ Public
router.post(
  "/register",
  twoMinutesLimiter,
  validate(registerSchema),
  registerUser,
);
// RESTRICTED: Test utility endpoint (only for dev/test environments)
router.delete("/delete-by-email", validate(emailOnlySchema), deleteUserByEmail);
router.post("/login", twoMinutesLimiter, validate(loginSchema), loginUser);
router.post(
  "/forgot-password",
  twoMinutesLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  twoMinutesLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);

router.get("/verify", verifyEmailCallback);

// ✅ Protected
// router.get("/profile", authenticate, getProfile);

// ✅ Protected + permission
// router.get("/", authenticate, requirePanel(PANELS.ADMIN), requirePermission(PERMISSIONS.USERS.READ), getAllUsers);
// router.delete("/:id", authenticate, requirePanel(PANELS.ADMIN), requirePermission(PERMISSIONS.USERS.DELETE), deleteUser);

export default router;
