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
  const ownerId = req.user?.id;

  if (!ownerId) {
    throw new AppError(tAlerts("unauthorized") || "Owner ID is required", 401);
  }

  let imageUrls: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    imageUrls = (req.files as Express.Multer.File[]).map((file) => file.path);
  }

  const product = await Product.create({
    ...data,
    owner: ownerId,
    images: imageUrls,
  });

  sendResponse(res, 201, tAlerts("product_created_success") || "Product added successfully", product);
});
