import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { sendUserForgotPasswordEmail } from "../../middleware/verification-middleware/emailVerification/sendUserEmails/sendUserForgotPasswordEmail.js";
import {
  validateForgotPassword,
  validateResetPassword,
} from "../../utils/validations/forms/forgotPasswordValidations.js";

// ── Forgot Password ───────────────────────────────────────────────────────────
// Accepts an email, validates it, looks the user up, and sends a reset link.
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

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
        message:
          "თუ ეს ელ-ფოსტა რეგისტრირებულია, პაროლის აღდგენის ლინკი გაიგზავნება",
      });
      return;
    }

    await sendUserForgotPasswordEmail(trimmedEmail);

    res.status(200).json({
      message:
        "თუ ეს ელ-ფოსტა რეგისტრირებულია, პაროლის აღდგენის ლინკი გაიგზავნება",
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

    if (!token) {
      res.status(422).json({ message: "ტოკენი სავალდებულოა" });
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
      res.status(400).json({ message: "ტოკენი არასწორია ან ვადა გასულია" });
      return;
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      res.status(404).json({ message: "მომხმარებელი არ მოიძებნა" });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ message: "პაროლი წარმატებით შეიცვალა" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
