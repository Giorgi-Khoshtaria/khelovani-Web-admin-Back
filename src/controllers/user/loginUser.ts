import bcrypt from "bcrypt";
import User from "../../modules/user.modules.js";
import { generateJWTToken } from "../../utils/token/genereateJWT-token.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { setAuthCookies } from "../../utils/token/authCookie.js";

/**
 * @desc    Login user
 * @route   POST /api/user/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

  // 1. Find user
  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!user) {
    throw new AppError(tAuth("invalid_email_password"), 422);
  }

  // 2. Check if verified
  if (!user.isVerified) {
    return sendResponse(res, 403, tAuth("email_not_verified"), {
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  // 3. Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(tAuth("invalid_email_password"), 422);
  }

  // 4. Generate token
  const token = generateJWTToken({
    id: user._id.toString(),
  });

  // 5. Issue the token as an httpOnly cookie (never exposed to browser JS)
  setAuthCookies(res, token);

  // 6. Prepare user object (omit password)
  const userObj = user.toObject();
  delete (userObj as any).password;

  sendResponse(res, 200, tAuth("login_success"), {
    user: userObj,
  });
});
