import mongoose from "mongoose";
import Favorite from "../../modules/favorite.modules.js";
import Product from "../../modules/product.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Add a product to the current user's favorites
 * @route   POST /api/favorites/:productId
 * @access  Private (user)
 */
export const addFavorite = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const productId = req.params.productId as string;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid product ID format", 400);
  }

  const product = await Product.findById(productId).select("price isShown");
  if (!product || !product.isShown) {
    throw new AppError("Product not found", 404);
  }

  const favorite = await Favorite.findOneAndUpdate(
    { user: req.user.id, product: productId },
    { $setOnInsert: { priceAtSave: product.price } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  sendResponse(res, 200, "Added to favorites", favorite);
});
