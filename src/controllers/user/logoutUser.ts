import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { clearAuthCookies } from "../../utils/token/authCookie.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

/**
 * @desc    Log out user — clears the auth cookies
 * @route   POST /api/user/logout
 * @access  Public (clearing cookies is harmless when none are set)
 */
export const logoutUser = asyncHandler(async (req, res) => {
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

  clearAuthCookies(res);

  sendResponse(res, 200, tAuth("logout_success"));
});
