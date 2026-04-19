import Product from "../../modules/product.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Add a new product
 * @route   POST /api/products
 * @access  Private Partner
 */
export const addProduct = asyncHandler(async (req, res) => {
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  const data = req.body;
  const requesterId = req.user?.id;
  const userRole = req.user?.role?.toLowerCase();
  const targetPartnerId = req.params.id;

  if (!requesterId) {
    throw new AppError(tAlerts("unauthorized") || "Unauthorized", 401);
  }

  const isAdmin = userRole === "admin" || req.user?.permissions?.includes("products.viewAll");
  if (!isAdmin && requesterId !== targetPartnerId) {
    throw new AppError("Forbidden: Cannot create products for another partner", 403);
  }

  const filesDict = req.files as Record<string, Express.Multer.File[]> | undefined;
  const imageFiles = filesDict?.["images"];

  if (!imageFiles || imageFiles.length === 0) {
    throw new AppError(tAlerts("images_required") || "At least one image is required", 422);
  }

  const imageUrls = imageFiles.map((file) => file.path);

  const product = await Product.create({
    ...data,
    owner: targetPartnerId,
    images: imageUrls,
  });

  sendResponse(res, 201, tAlerts("product_created_success") || "Product added successfully", product);
});
