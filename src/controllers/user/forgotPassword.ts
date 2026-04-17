import User from "../../modules/user.modules.js";
import { sendUserForgotPasswordEmail } from "../../utils/email/sendUserEmails.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

/**
 * @desc    Forgot password
 * @route   POST /api/user/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

  const trimmedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: trimmedEmail });

  // Always respond with 200 to prevent email enumeration
  if (!user || !user.isVerified) {
    return sendResponse(res, 200, tAuth("forgot_password_success"));
  }

  await sendUserForgotPasswordEmail(trimmedEmail, lang);

  sendResponse(res, 200, tAuth("forgot_password_success"));
});
