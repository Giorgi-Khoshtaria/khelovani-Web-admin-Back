import type { Request, Response } from "express";
import PaymentCard from "../../../modules/paymentCard.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Set one of the current user's cards as default
 * @route   PATCH /api/user/cards/:id/default
 * @access  Private — authenticated user
 */
export const setDefaultCard = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const card = await PaymentCard.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!card) throw new AppError("Card not found", 404);

    await PaymentCard.updateMany(
      { user: req.user.id },
      { $set: { isDefault: false } },
    );
    card.isDefault = true;
    await card.save();

    const cards = await PaymentCard.find({ user: req.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    sendResponse(res, 200, "Default card updated", cards);
  },
);
