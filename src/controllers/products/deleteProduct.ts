import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, getCloudinaryPublicId } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:productId
 * @access  Private Admin/Owner
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  const { productId } = req.params;
  const userRole = req.user?.role?.toLowerCase();
  const userId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(productId as string)) {
    throw new AppError(tAlerts("invalid_product_id") || "Invalid product ID format", 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(tAlerts("product_not_found") || "Product not found", 404);
  }

  const isOwner = product.owner.toString() === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError(tAlerts("unauthorized_delete") || "Unauthorized: You cannot delete this product", 403);
  }

  if (product.images && product.images.length > 0) {
    const cloudinary = (await import("../../utils/config/cloudinary.js")).default;
    const deletePromises = product.images.map(async (imageUrl) => {
      try {
        const publicId = getCloudinaryPublicId(imageUrl);
        if (publicId) {
          // @ts-ignore
          return await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    });
    await Promise.all(deletePromises);
  }

  await product.deleteOne();

  sendResponse(res, 200, tAlerts("product_deleted_success") || "Product deleted successfully");
});
