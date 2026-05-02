import Category from "../../../modules/category.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";

/**
 * @desc    Get all categories
 * @route   GET /api/admin/categories
 * @access  Private Admin
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { active } = req.query;

  const query: any = {};
  if (active === "true") query.isActive = true;
  if (active === "false") query.isActive = false;

  const categories = await Category.find(query).sort({ slug: 1 });

  sendResponse(res, 200, "Categories retrieved successfully", categories);
});
