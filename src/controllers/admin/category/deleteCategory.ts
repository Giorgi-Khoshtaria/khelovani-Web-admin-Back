import mongoose from "mongoose";
import Category from "../../../modules/category.modules.js";
import Item from "../../../modules/item.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { invalidateCategories } from "../../../utils/cache/invalidators.js";

/**
 * @desc    Delete a category (hard delete — only if no items reference it)
 * @route   DELETE /api/admin/categories/:id
 * @access  Private Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError("Invalid ID format", 422);
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const inUseCount = await Item.countDocuments({ category: category.slug });
  if (inUseCount > 0) {
    throw new AppError(
      `Cannot delete: ${inUseCount} item(s) reference this category. Deactivate it instead.`,
      409,
    );
  }

  await Category.findByIdAndDelete(id);

  void invalidateCategories();
  sendResponse(res, 200, "Category deleted successfully", { _id: id });
});
