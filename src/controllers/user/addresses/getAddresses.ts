import type { Request, Response } from "express";
import Address from "../../../modules/address.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    List the current user's addresses (default first)
 * @route   GET /api/user/addresses
 * @access  Private — authenticated user
 */
export const getAddresses = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const addresses = await Address.find({ user: req.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    sendResponse(res, 200, "Addresses retrieved", addresses);
  },
);
