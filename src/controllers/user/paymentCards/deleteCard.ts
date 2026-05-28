import type { Request, Response } from "express";
import PaymentCard from "../../../modules/paymentCard.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Delete one of the current user's cards
 * @route   DELETE /api/user/cards/:id
 * @access  Private — authenticated user
 */
export const deleteCard = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const card = await PaymentCard.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!card) throw new AppError("Card not found", 404);

  // If the deleted card was default, promote the most recent remaining card
  if (card.isDefault) {
    const next = await PaymentCard.findOne({ user: req.user.id }).sort({
      createdAt: -1,
    });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  sendResponse(res, 200, "Card deleted");
});
