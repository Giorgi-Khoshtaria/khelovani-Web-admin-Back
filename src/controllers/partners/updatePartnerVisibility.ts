import mongoose from "mongoose";
import Organisation from "../../modules/organization.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Show or hide a partner from public listings
 * @route   PATCH /api/admin/partners/:id/visibility
 * @access  Private Admin
 */
export const updatePartnerVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isShown } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid partner id", 422);
  }

  const updated = await Organisation.findByIdAndUpdate(
    id,
    { $set: { isShown } },
    { new: true },
  ).select("-password");

  if (!updated) throw new AppError("Partner not found", 404);

  sendResponse(res, 200, `Partner ${isShown ? "shown" : "hidden"}`, updated);
});
