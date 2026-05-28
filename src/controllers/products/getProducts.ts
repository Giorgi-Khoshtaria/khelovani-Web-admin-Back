import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";
import { PartnerTypeEnum } from "../../types/partnerTypes.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { getCategoryPlaceholder } from "../../utils/imageFallback.js";

const MAX_LIMIT = 50;

const placeholderCache = new Map<string, string>();
function getCachedPlaceholder(category: string): string {
  if (!placeholderCache.has(category)) {
    placeholderCache.set(category, getCategoryPlaceholder(category));
  }
  return placeholderCache.get(category)!;
}

const ALLOWED_SORT_FIELDS: Record<string, string> = {
  price: "price",
  name: "titleEn",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  stockQuantity: "stockQuantity",
};

function buildSortOption(sortParam: unknown): Record<string, 1 | -1> {
  if (!sortParam || typeof sortParam !== "string") return { createdAt: -1 };
  const [field, direction] = sortParam.split(":");
  const mongoField = ALLOWED_SORT_FIELDS[field];
  if (!mongoField) return { createdAt: -1 };
  return { [mongoField]: direction === "asc" ? 1 : -1 };
}

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

  const { search, category, partnerId: queryPartnerId, ownerType, condition } = req.query;

  const pageNumber = Math.max(1, parseInt(req.query.page as string) || 1);
  const limitNumber = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit as string) || 15));
  const skip = (pageNumber - 1) * limitNumber;

  const sortOption = buildSortOption(req.query.sort);

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
    query.owner = new mongoose.Types.ObjectId(targetPartnerId as string);
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
    const searchTerm = String(search).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").slice(0, 200);
    if (!searchTerm) return void sendResponse(res, 200, tAlerts("products_fetched_success") || "Products retrieved successfully", [], { total: 0, page: pageNumber, limit: limitNumber, totalPages: 0 });
    const searchRegex = { $regex: escapeRegex(searchTerm), $options: "i" };
    query.$or = [{ titleGe: searchRegex }, { titleEn: searchRegex }];
  }

  const rawMin = req.query.minPrice;
  const rawMax = req.query.maxPrice;
  const minPrice = rawMin !== undefined ? parseFloat(String(rawMin)) : NaN;
  const maxPrice = rawMax !== undefined ? parseFloat(String(rawMax)) : NaN;

  if (!Number.isNaN(minPrice) && minPrice >= 0) {
    query.price = { ...query.price, $gte: minPrice };
  }
  if (!Number.isNaN(maxPrice) && maxPrice >= 0) {
    query.price = { ...query.price, $lte: maxPrice };
  }

  if (req.query.inStock === "true") {
    query.stockQuantity = { $gt: 0 };
  }

  if (ownerType === PartnerTypeEnum.ORGANIZATION || ownerType === PartnerTypeEnum.INDIVIDUAL) {
    query.ownerType = ownerType;
  }

  if (condition && typeof condition === "string") {
    query.condition = condition;
  }

  const [products, totalCount] = await Promise.all([
    Product.find(query)
      // pinSection !== null sorts above null (ascending puts nulls last in Mongo)
      .sort({ pinSection: 1, pinnedAt: -1, ...sortOption })
      .skip(skip)
      .limit(limitNumber)
      .populate({ path: "owner", select: "companyNameGe companyNameEn" })
      .select("-__v"),
    Product.countDocuments(query),
  ]);

  const productsWithFallbacks = products.map((product: any) => {
    const p = product.toObject();
    if (!p.images || p.images.length === 0) {
      p.images = [getCachedPlaceholder(p.category)];
    }
    return p;
  });

  const searchStr = search ? String(search).slice(0, 200) : undefined;

  sendResponse(res, 200, tAlerts("products_fetched_success") || "Products retrieved successfully", productsWithFallbacks, {
    totalCount,
    currentPage: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(totalCount / limitNumber),
    ...(searchStr ? { search: searchStr } : {}),
  });
});
