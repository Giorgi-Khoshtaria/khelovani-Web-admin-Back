import type { Request, Response } from "express";
import Address from "../../../modules/address.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Set one of the current user's addresses as default
 * @route   PATCH /api/user/addresses/:id/default
 * @access  Private — authenticated user
 */
export const setDefaultAddress = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!address) throw new AppError("Address not found", 404);

    await Address.updateMany(
      { user: req.user.id },
      { $set: { isDefault: false } },
    );
    address.isDefault = true;
    await address.save();

    const addresses = await Address.find({ user: req.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    sendResponse(res, 200, "Default address updated", addresses);
  },
);
