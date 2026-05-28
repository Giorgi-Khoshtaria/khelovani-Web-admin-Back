import type { Request, Response } from "express";
import PaymentCard from "../../../modules/paymentCard.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    List the current user's payment cards (default first)
 * @route   GET /api/user/cards
 * @access  Private — authenticated user
 */
export const getCards = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const cards = await PaymentCard.find({ user: req.user.id })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();

  sendResponse(res, 200, "Cards retrieved", cards);
});
