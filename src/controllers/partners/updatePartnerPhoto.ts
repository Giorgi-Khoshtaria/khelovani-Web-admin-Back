import mongoose from "mongoose";
import Organisation from "../../modules/organization.modules.js";
import { ROLES } from "../../middleware/role/permissions.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { invalidatePartners } from "../../utils/cache/invalidators.js";

/**
 * @desc    Update partner photo
 * @route   PATCH /api/admin/partners/:id/photo
 * @access  Private Admin/Owner
 */
export const updatePartnerPhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_partner_id"), 422);
  }

  if (req.user?.role !== ROLES.ADMIN && req.user?.id !== id) {
    throw new AppError(tAuth("access_denied"), 403);
  }

  if (!req.file) {
    throw new AppError(tAlerts("no_file_uploaded"), 422);
  }

  // Check existence before update so we don't orphan the uploaded file
  const exists = await Organisation.findById(id).select("_id");
  if (!exists) {
    throw new AppError(tAuth("partner_not_found"), 404);
  }

  const imageUrl = req.file.path;

  const partner = await Organisation.findByIdAndUpdate(
    id,
    { $set: { profilePhoto: imageUrl } },
    { new: true },
  ).select("-password");

  void invalidatePartners();

  sendResponse(
    res,
    200,
    tAuth("photo_updated") || "Photo updated successfully",
    partner,
  );
});
