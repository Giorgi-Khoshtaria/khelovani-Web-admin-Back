import Category from "../../../modules/category.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Create a new category
 * @route   POST /api/admin/categories
 * @access  Private Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { slug, nameGe, nameEn, isActive } = req.body;

  const existing = await Category.findOne({ slug: slug.toLowerCase() });
  if (existing) {
    throw new AppError("Category with this slug already exists", 409);
  }

  const dupGe = await Category.findOne({ nameGe });
  if (dupGe) {
    throw new AppError("Category with this Georgian name already exists", 409);
  }

  const dupEn = await Category.findOne({ nameEn });
  if (dupEn) {
    throw new AppError("Category with this English name already exists", 409);
  }

  const category = await Category.create({
    slug: slug.toLowerCase(),
    nameGe,
    nameEn,
    isActive: isActive ?? true,
  });

  sendResponse(res, 201, "Category created successfully", category);
});
