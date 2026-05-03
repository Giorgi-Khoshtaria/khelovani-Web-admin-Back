import { Router } from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  deleteUserByEmail,
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
  deleteAccount,
} from "../controllers/user/index.js";
import {
  twoMinutesLimiter,
} from "../utils/limiters/rate-limit.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { verifyEmailCallback } from "../controllers/verification/index.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validations/schemas/userAuth/login.schema.js";
import { registerSchema } from "../validations/schemas/userAuth/register.schema.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/schemas/userAuth/forgotPassword.schema.js";
import { emailOnlySchema } from "../validations/schemas/user/user.schema.js";
import { profileUpdateSchema } from "../validations/schemas/user/profileUpdate.schema.js";
import { changePasswordSchema } from "../validations/schemas/user/changePassword.schema.js";
import upload from "../utils/config/multer.js";
import { handleMulterError } from "../middleware/error/handleMulterError.js";
import { CloudinaryFolder } from "../types/cloudinaryFolder.enum.js";

const router = Router();

// ✅ Public
router.post("/register", twoMinutesLimiter, validate(registerSchema), registerUser);
router.delete("/delete-by-email", validate(emailOnlySchema), deleteUserByEmail);
router.post("/login", twoMinutesLimiter, validate(loginSchema), loginUser);
router.post("/forgot-password", twoMinutesLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", twoMinutesLimiter, validate(resetPasswordSchema), resetPassword);
router.get("/verify", verifyEmailCallback);

// ✅ Protected — profile
router.get("/profile", authenticate, getProfile);
router.patch("/profile", authenticate, validate(profileUpdateSchema), updateProfile);
router.post(
  "/profile/image",
  authenticate,
  (req, _res, next) => { (req as any).cloudinaryFolder = CloudinaryFolder.Users; next(); },
  upload.single("profileImage"),
  handleMulterError,
  uploadProfileImage,
);
router.delete("/profile/image", authenticate, deleteProfileImage);

// ✅ Protected — account
router.patch("/password", authenticate, validate(changePasswordSchema), changePassword);
router.delete("/account", authenticate, deleteAccount);

export default router;
