import Favorite from "../../modules/favorite.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Get just the product IDs the current user has favorited.
 *          Used to hydrate heart icons across the site cheaply.
 * @route   GET /api/favorites/ids
 * @access  Private (user)
 */
export const getFavoriteIds = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const rows = await Favorite.find({ user: req.user.id }).select("product").lean();
  sendResponse(res, 200, "Favorite IDs retrieved", rows.map((r: any) => String(r.product)));
});

/**
 * @desc    Clear all favorites for the current user
 * @route   DELETE /api/favorites
 * @access  Private (user)
 */
export const clearFavorites = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);
  await Favorite.deleteMany({ user: req.user.id });
  sendResponse(res, 200, "Favorites cleared");
});
