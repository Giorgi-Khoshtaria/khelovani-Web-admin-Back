import mongoose from "mongoose";
import Organisation from "../../modules/organization.modules.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Get public partner by ID
 * @route   GET /api/partner/public/:id
 * @access  Public
 */
export const getPublicPartnerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_partner_id"), 422);
  }

  const partner = await Organisation.findOne({
    _id: id,
    status: PartnerStatusEnum.APPROVED,
    isShown: true,
  }).select("-password");

  if (!partner) {
    throw new AppError(
      tAlerts("partner_not_found") || "Partner not found",
      404,
    );
  }

  sendResponse(res, 200, "Public partner retrieved successfully", partner);
});
