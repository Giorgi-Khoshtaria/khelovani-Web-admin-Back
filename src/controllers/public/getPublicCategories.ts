import Category from "../../modules/category.modules.js";
import Product from "../../modules/product.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

/**
 * @desc    Get all active categories with product counts (public, no auth required)
 * @route   GET /api/categories
 * @access  Public
 */
export const getPublicCategories = asyncHandler(async (_req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find({ isActive: true })
      .select("slug nameGe nameEn")
      .sort({ nameGe: 1 })
      .lean(),
    Product.aggregate([
      { $match: { isShown: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map<string, number>(
    counts.map((c: any) => [c._id, c.count]),
  );

  const enriched = categories.map((c: any) => ({
    ...c,
    productCount: countMap.get(c.slug) ?? 0,
  }));

  sendResponse(res, 200, "Categories fetched successfully", enriched);
});
