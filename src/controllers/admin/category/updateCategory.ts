import mongoose from "mongoose";
import Category from "../../../modules/category.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Update a category
 * @route   PUT /api/admin/categories/:id
 * @access  Private Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { slug, nameGe, nameEn, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError("Invalid ID format", 422);
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (slug !== undefined && slug !== category.slug) {
    const dup = await Category.findOne({ slug: slug.toLowerCase(), _id: { $ne: id } });
    if (dup) throw new AppError("Category with this slug already exists", 409);
    category.slug = slug.toLowerCase();
  }

  if (nameGe !== undefined && nameGe !== category.nameGe) {
    const dup = await Category.findOne({ nameGe, _id: { $ne: id } });
    if (dup) throw new AppError("Category with this Georgian name already exists", 409);
    category.nameGe = nameGe;
  }

  if (nameEn !== undefined && nameEn !== category.nameEn) {
    const dup = await Category.findOne({ nameEn, _id: { $ne: id } });
    if (dup) throw new AppError("Category with this English name already exists", 409);
    category.nameEn = nameEn;
  }

  if (isActive !== undefined) category.isActive = isActive;

  const updated = await category.save();

  sendResponse(res, 200, "Category updated successfully", updated);
});
