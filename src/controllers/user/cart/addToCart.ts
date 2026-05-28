import type { Request, Response } from "express";
import Cart from "../../../modules/cart.modules.js";
import Product from "../../../modules/product.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

const MAX_DISTINCT_ITEMS = 50;

/**
 * @desc    Add a product to the cart, or bump the quantity if already present
 * @route   POST /api/user/cart/items
 * @access  Private — authenticated user
 */
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const { productId, quantity = 1 } = req.body as {
    productId: string;
    quantity?: number;
  };

  const product = await Product.findById(productId);
  if (!product || product.isShown === false) {
    throw new AppError("Product not found", 404);
  }
  if (product.stockQuantity <= 0) {
    throw new AppError("Product out of stock", 409);
  }

  const cart =
    (await Cart.findOne({ user: req.user.id })) ??
    (await Cart.create({ user: req.user.id, items: [] }));

  const existing = cart.items.find((i) => i.product.toString() === productId);

  if (existing) {
    const newQty = Math.min(
      existing.quantity + quantity,
      product.stockQuantity,
      99,
    );
    existing.quantity = newQty;
  } else {
    if (cart.items.length >= MAX_DISTINCT_ITEMS) {
      throw new AppError("Cart is full", 409);
    }
    cart.items.push({
      product: product._id as any,
      quantity: Math.min(quantity, product.stockQuantity, 99),
      addedAt: new Date(),
    });
  }

  await cart.save();
  await cart.populate({ path: "items.product", model: Product });

  sendResponse(res, 200, "Item added to cart", cart);
});
