import type { Request, Response } from "express";
import Address from "../../../modules/address.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

const MAX_ADDRESSES = 20;

/**
 * @desc    Add an address for the current user
 * @route   POST /api/user/addresses
 * @access  Private — authenticated user
 */
export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const {
    type,
    label,
    addressLine,
    city,
    postalCode,
    additionalComment,
    lat,
    lng,
    formattedAddress,
    isDefault,
  } = req.body;

  const existingCount = await Address.countDocuments({ user: req.user.id });
  if (existingCount >= MAX_ADDRESSES) {
    throw new AppError("Address limit reached", 409);
  }

  const makeDefault = existingCount === 0 || isDefault === true;

  if (makeDefault) {
    await Address.updateMany(
      { user: req.user.id },
      { $set: { isDefault: false } },
    );
  }

  const address = await Address.create({
    user: req.user.id,
    type,
    label,
    addressLine,
    city,
    postalCode: postalCode || undefined,
    additionalComment: additionalComment || undefined,
    lat,
    lng,
    formattedAddress: formattedAddress || undefined,
    isDefault: makeDefault,
  });

  sendResponse(res, 201, "Address added", address);
});
