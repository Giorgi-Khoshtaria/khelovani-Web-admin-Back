import type { Request, Response } from "express";
import Address from "../../../modules/address.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Update one of the current user's addresses
 * @route   PATCH /api/user/addresses/:id
 * @access  Private — authenticated user
 */
export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
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

    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!address) throw new AppError("Address not found", 404);

    if (isDefault === true && !address.isDefault) {
      await Address.updateMany(
        { user: req.user.id },
        { $set: { isDefault: false } },
      );
      address.isDefault = true;
    }

    address.type = type;
    address.label = label;
    address.addressLine = addressLine;
    address.city = city;
    address.postalCode = postalCode || undefined;
    address.additionalComment = additionalComment || undefined;
    address.lat = lat;
    address.lng = lng;
    address.formattedAddress = formattedAddress || undefined;

    await address.save();

    sendResponse(res, 200, "Address updated", address);
  },
);
