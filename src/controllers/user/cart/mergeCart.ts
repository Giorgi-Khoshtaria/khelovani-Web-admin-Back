import type { Request, Response } from "express";
import Cart from "../../../modules/cart.modules.js";
import Product from "../../../modules/product.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

const MAX_DISTINCT_ITEMS = 50;

/**
 * @desc    Merge a guest cart (from localStorage) into the user's DB cart.
 *          Quantities for existing items are summed, then capped by stock.
 *          Unknown / hidden / out-of-stock products are silently dropped.
 * @route   POST /api/user/cart/merge
 * @access  Private — authenticated user
 */
export const mergeCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const { items } = req.body as {
    items: { productId: string; quantity: number }[];
  };

  const cart =
    (await Cart.findOne({ user: req.user.id })) ??
    (await Cart.create({ user: req.user.id, items: [] }));

  if (items?.length) {
    const ids = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids }, isShown: true });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const { productId, quantity } of items) {
      const product = productMap.get(productId);
      if (!product || product.stockQuantity <= 0) continue;

      const existing = cart.items.find(
        (i) => i.product.toString() === productId,
      );

      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + quantity,
          product.stockQuantity,
          99,
        );
      } else {
        if (cart.items.length >= MAX_DISTINCT_ITEMS) break;
        cart.items.push({
          product: product._id as any,
          quantity: Math.min(quantity, product.stockQuantity, 99),
          addedAt: new Date(),
        });
      }
    }
    await cart.save();
  }

  await cart.populate({ path: "items.product", model: Product });

  sendResponse(res, 200, "Cart merged", cart);
});
