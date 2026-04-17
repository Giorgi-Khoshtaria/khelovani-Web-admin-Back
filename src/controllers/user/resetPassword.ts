import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../modules/user.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Reset password
 * @route   POST /api/user/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

  // 1. Verify the token
  let decoded: { email: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
  } catch {
    throw new AppError(tAuth("token_invalid"), 400);
  }

  // 2. Find user
  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    throw new AppError(tAuth("user_not_found"), 404);
  }

  // 3. Update password
  user.password = await bcrypt.hash(password, 10);
  await user.save();

  sendResponse(res, 200, tAuth("password_reset_success"));
});
