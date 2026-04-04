import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { validateForgotPassword } from "../../validations/forms/forgotPasswordValidations.js";
import { sendUserForgotPasswordEmail } from "../../utils/email/sendUserEmails.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

// @desc    Forgot password
// @route   POST /api/user/forgot-password
// @access  Public
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    // Validate input
    const errors = validateForgotPassword({ email }, lang);
    if (Object.keys(errors).length > 0) {
      res.status(422).json({ errors });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail });

    // Always respond with 200 to prevent email enumeration
    if (!user || !user.isVerified) {
      res.status(200).json({
        message: tAuth("forgot_password_success"),
      });
      return;
    }

    await sendUserForgotPasswordEmail(trimmedEmail, lang);

    res.status(200).json({
      message: tAuth("forgot_password_success"),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
