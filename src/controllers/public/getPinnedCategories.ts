import Category from "../../modules/category.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

/**
 * @desc    Get pinned categories (max 4)
 * @route   GET /api/categories/pinned
 * @access  Public
 */
export const getPinnedCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true, isPinned: true })
    .select("slug nameGe nameEn")
    .sort({ pinnedAt: -1 })
    .limit(4);

  sendResponse(res, 200, "Pinned categories fetched successfully", categories);
});
