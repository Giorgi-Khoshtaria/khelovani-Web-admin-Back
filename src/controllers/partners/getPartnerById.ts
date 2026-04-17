import mongoose from "mongoose";
import Organisation from "../../modules/organization.modules.js";
import { ROLES } from "../../middleware/role/permissions.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Get partner by ID
 * @route   GET /api/admin/partners/:id
 * @access  Private Admin/Owner
 */
export const getPartnerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_partner_id"), 422);
  }

  // Check if user is admin or is viewing their own profile
  if (req.user?.role !== ROLES.ADMIN && req.user?.id !== id) {
    throw new AppError(tAuth("access_denied"), 403);
  }

  const partner = await Organisation.findById(id).select("-password");
  if (!partner) {
    throw new AppError(tAuth("partner_not_found"), 404);
  }

  sendResponse(res, 200, "Partner retrieved successfully", partner);
});
