import type { Request, Response } from "express";
import Cart from "../../../modules/cart.modules.js";
import Product from "../../../modules/product.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Get the current user's cart (auto-creates an empty one if missing).
 *          Populates products. Drops items whose product was deleted or hidden.
 * @route   GET /api/user/cart
 * @access  Private — authenticated user
 */
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  let cart = await Cart.findOne({ user: req.user.id }).populate({
    path: "items.product",
    model: Product,
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Drop items whose product was deleted or hidden — keep cart honest.
  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    (i) => i.product && (i.product as any).isShown !== false,
  );
  if (cart.items.length !== initialLength) {
    await cart.save();
  }

  sendResponse(res, 200, "Cart retrieved", cart);
});
