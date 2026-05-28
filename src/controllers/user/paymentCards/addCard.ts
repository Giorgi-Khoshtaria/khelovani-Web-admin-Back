import type { Request, Response } from "express";
import PaymentCard from "../../../modules/paymentCard.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Add a payment card for the current user
 * @route   POST /api/user/cards
 * @access  Private — authenticated user
 */
export const addCard = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const { holderName, brand, last4, expMonth, expYear, isDefault } = req.body;

  const existingCount = await PaymentCard.countDocuments({ user: req.user.id });
  const makeDefault = existingCount === 0 || isDefault === true;

  if (makeDefault) {
    await PaymentCard.updateMany(
      { user: req.user.id },
      { $set: { isDefault: false } },
    );
  }

  const card = await PaymentCard.create({
    user: req.user.id,
    holderName,
    brand,
    last4,
    expMonth,
    expYear,
    isDefault: makeDefault,
  });

  sendResponse(res, 201, "Card added", card);
});
