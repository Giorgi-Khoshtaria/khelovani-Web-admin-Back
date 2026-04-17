import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { getCategoryPlaceholder } from "../../utils/imageFallback.js";

const MAX_LIMIT = 100;

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public/Private
 */
export const getProducts = asyncHandler(async (req, res) => {
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  const partnerId = req.params.id;
  const userRole = req.user?.role?.toLowerCase();
  const userId = req.user?.id;

  const { search, category, partnerId: queryPartnerId } = req.query;

  const pageNumber = Math.max(1, parseInt(req.query.page as string) || 1);
  const limitNumber = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit as string) || 15));
  const skip = (pageNumber - 1) * limitNumber;

  let query: any = {};

  const targetPartnerId = partnerId || queryPartnerId;
  const isAdmin = userRole === "admin" || req.user?.permissions?.includes("products.viewAll");

  if (targetPartnerId) {
    if (!mongoose.Types.ObjectId.isValid(targetPartnerId as string)) {
      throw new AppError(tAlerts("invalid_partner_id") || "Invalid partner ID format", 400);
    }
    if (!isAdmin && targetPartnerId !== userId) {
      throw new AppError("Forbidden: Cannot access another partner's products", 403);
    }
    query.owner = targetPartnerId;
  } else {
    if (!isAdmin) {
      query.isShown = true;
    }
  }

  if (category && category !== "all") {
    const categoryValue = Array.isArray(category) ? category[category.length - 1] : category;
    query.category = { $regex: new RegExp(`^${escapeRegex(String(categoryValue))}(_|$)`, "i") };
  }

  if (search) {
    const searchRegex = { $regex: escapeRegex(String(search)), $options: "i" };
    query.$or = [{ titleGe: searchRegex }, { titleEn: searchRegex }];
  }

  const [products, totalCount] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .select("-__v"),
    Product.countDocuments(query),
  ]);

  const productsWithFallbacks = products.map((product: any) => {
    const p = product.toObject();
    if (!p.images || p.images.length === 0) {
      p.images = [getCategoryPlaceholder(p.category)];
    }
    return p;
  });

  sendResponse(res, 200, tAlerts("products_fetched_success") || "Products retrieved successfully", productsWithFallbacks, {
    totalCount,
    totalPages: Math.ceil(totalCount / limitNumber),
    currentPage: pageNumber,
  });
});
