import type { Request, Response } from "express";
import Address from "../../../modules/address.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Delete one of the current user's addresses
 * @route   DELETE /api/user/addresses/:id
 * @access  Private — authenticated user
 */
export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!address) throw new AppError("Address not found", 404);

    // If the deleted address was default, promote the most recent remaining one
    if (address.isDefault) {
      const next = await Address.findOne({ user: req.user.id }).sort({
        createdAt: -1,
      });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    sendResponse(res, 200, "Address deleted");
  },
);
