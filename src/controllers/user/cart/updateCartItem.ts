import type { Request, Response } from "express";
import Cart from "../../../modules/cart.modules.js";
import Product from "../../../modules/product.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Set the quantity of an item already in the cart
 * @route   PATCH /api/user/cart/items/:productId
 * @access  Private — authenticated user
 */
export const updateCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const { productId } = req.params;
    const { quantity } = req.body as { quantity: number };

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) throw new AppError("Cart not found", 404);

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) throw new AppError("Item not in cart", 404);

    const product = await Product.findById(productId);
    if (!product) throw new AppError("Product not found", 404);

    item.quantity = Math.min(quantity, product.stockQuantity, 99);
    await cart.save();
    await cart.populate({ path: "items.product", model: Product });

    sendResponse(res, 200, "Cart updated", cart);
  },
);
