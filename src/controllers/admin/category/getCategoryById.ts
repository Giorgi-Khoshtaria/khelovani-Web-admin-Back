import mongoose from "mongoose";
import Category from "../../../modules/category.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Get single category by ID
 * @route   GET /api/admin/categories/:id
 * @access  Private Admin
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError("Invalid ID format", 422);
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  sendResponse(res, 200, "Category retrieved successfully", category);
});
