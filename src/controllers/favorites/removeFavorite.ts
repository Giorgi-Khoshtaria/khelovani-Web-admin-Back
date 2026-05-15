import mongoose from "mongoose";
import Favorite from "../../modules/favorite.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Remove a product from the current user's favorites
 * @route   DELETE /api/favorites/:productId
 * @access  Private (user)
 */
export const removeFavorite = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const productId = req.params.productId as string;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid product ID format", 400);
  }

  await Favorite.deleteOne({ user: req.user.id, product: productId });
  sendResponse(res, 200, "Removed from favorites");
});
