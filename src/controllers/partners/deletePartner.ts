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
 * @desc    Delete partner
 * @route   DELETE /api/admin/partners/:id
 * @access  Private Admin/Owner
 */
export const deletePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_partner_id"), 422);
  }

  // Only the partner themselves or an admin can delete their account
  if (req.user?.id !== id && req.user?.role !== ROLES.ADMIN) {
    throw new AppError(tAuth("access_denied_only_owner_can_delete"), 403);
  }

  const partner = await Organisation.findById(id);
  if (!partner) {
    throw new AppError(tAuth("partner_not_found"), 404);
  }

  await partner.deleteOne();

  void invalidatePartners();

  sendResponse(
    res,
    200,
    tAlerts("partner_deleted") || "Partner deleted successfully",
  );
});
