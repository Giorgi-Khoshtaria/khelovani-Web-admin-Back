import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { getCategoryPlaceholder } from "../../utils/imageFallback.js";

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:productId
 * @access  Public (for shown products)
 */
export const getProductById = asyncHandler(async (req, res) => {
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  const { productId } = req.params;
  const userRole = req.user?.role?.toLowerCase();
  const userId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(productId as string)) {
    throw new AppError(tAlerts("invalid_product_id") || "Invalid product ID format", 400);
  }

  const product = await Product.findById(productId).select("-__v");
  if (!product) {
    throw new AppError(tAlerts("product_not_found") || "Product not found", 404);
  }

  const isOwner = product.owner.toString() === userId;
  const isAdmin =
    userRole === "admin" || req.user?.permissions?.includes("products.viewAll");

  if (!product.isShown && !isOwner && !isAdmin) {
    throw new AppError(
      tAlerts("product_access_forbidden") || "Forbidden: You do not have permission to view this product",
      403,
    );
  }

  const productObj = product.toObject();
  if (!productObj.images || productObj.images.length === 0) {
    productObj.images = [getCategoryPlaceholder(productObj.category)];
  }

  sendResponse(res, 200, tAlerts("product_fetched_success") || "Product retrieved successfully", productObj);
});
