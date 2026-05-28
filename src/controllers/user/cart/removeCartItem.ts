import type { Request, Response } from "express";
import Cart from "../../../modules/cart.modules.js";
import Product from "../../../modules/product.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Remove an item from the cart
 * @route   DELETE /api/user/cart/items/:productId
 * @access  Private — authenticated user
 */
export const removeCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) throw new AppError("Cart not found", 404);

    const before = cart.items.length;
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId,
    ) as typeof cart.items;
    if (cart.items.length === before) {
      throw new AppError("Item not in cart", 404);
    }

    await cart.save();
    await cart.populate({ path: "items.product", model: Product });

    sendResponse(res, 200, "Item removed", cart);
  },
);
