import Category from "../../modules/category.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

/**
 * @desc    Get all active categories (public, no auth required)
 * @route   GET /api/categories
 * @access  Public
 */
export const getPublicCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true })
    .select("slug nameGe nameEn")
    .sort({ nameGe: 1 });

  sendResponse(res, 200, "Categories fetched successfully", categories);
});
