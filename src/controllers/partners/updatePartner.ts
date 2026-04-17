import bcrypt from "bcrypt";
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
 * @desc    Update partner info
 * @route   PATCH /api/admin/partners/:id
 * @access  Private Admin/Owner
 */
export const updatePartner = asyncHandler(async (req, res) => {
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

  const partner = await Organisation.findById(id);
  if (!partner) {
    throw new AppError(tAuth("partner_not_found"), 404);
  }

  let updateData: Record<string, any>;

  if (req.user?.role === ROLES.ADMIN) {
    updateData = { ...req.body };
  } else {
    // Explicit whitelist — partners can only update their own safe fields
    const {
      companyNameGe,
      companyNameEn,
      phone,
      address,
      city,
      website,
      description,
      password,
    } = req.body;
    updateData = {};
    if (companyNameGe !== undefined) updateData.companyNameGe = companyNameGe;
    if (companyNameEn !== undefined) updateData.companyNameEn = companyNameEn;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (website !== undefined) updateData.website = website;
    if (description !== undefined) updateData.description = description;
    if (password !== undefined) updateData.password = password;
  }

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedPartner = await Organisation.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true },
  ).select("-password");

  sendResponse(
    res,
    200,
    tAuth("partner_updated") || "Partner updated successfully",
    updatedPartner,
  );
});
