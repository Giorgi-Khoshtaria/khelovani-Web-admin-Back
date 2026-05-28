import type { Request, Response } from "express";
import Cart from "../../../modules/cart.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Clear all items from the current user's cart
 * @route   DELETE /api/user/cart
 * @access  Private — authenticated user
 */
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const cart = await Cart.findOne({ user: req.user.id });
  if (cart) {
    cart.items = [] as typeof cart.items;
    await cart.save();
  }

  sendResponse(res, 200, "Cart cleared");
});
