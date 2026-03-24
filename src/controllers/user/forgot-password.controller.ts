import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import {
  validateForgotPassword,
  validateResetPassword,
} from "../../validations/forms/forgotPasswordValidations.js";
import { sendUserForgotPasswordEmail } from "../../utils/email/sendUserEmails.js";
import { getTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";

// ── Forgot Password ───────────────────────────────────────────────────────────
// Accepts an email, validates it, looks the user up, and sends a reset link.
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const lang = (req.query.lang as Lang) || "ge";

    // Validate input
    const errors = validateForgotPassword({ email });
    if (Object.keys(errors).length > 0) {
      res.status(422).json({ errors });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail });

    // Always respond with 200 to prevent email enumeration
    if (!user || !user.isVerified) {
      res.status(200).json({
        message: getTranslation("auth", "forgot_password_success", lang),
      });
      return;
    }

    await sendUserForgotPasswordEmail(trimmedEmail, lang);

    res.status(200).json({
      message: getTranslation("auth", "forgot_password_success", lang),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
// Verifies the JWT reset token and updates the user's password.
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, password } = req.body;
    const lang = (req.query.lang as Lang) || "ge";

    if (!token) {
      res
        .status(422)
        .json({ message: getTranslation("auth", "token_required", lang) });
      return;
    }

    // Validate new password
    const errors = validateResetPassword({ password });
    if (Object.keys(errors).length > 0) {
      res.status(422).json({ errors });
      return;
    }

    // Verify the token
    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch {
      res
        .status(400)
        .json({ message: getTranslation("auth", "token_invalid", lang) });
      return;
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      res
        .status(404)
        .json({ message: getTranslation("auth", "user_not_found", lang) });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res
      .status(200)
      .json({
        message: getTranslation("auth", "password_reset_success", lang),
      });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
