import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, getCloudinaryPublicId } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Update a product
 * @route   PUT /api/products/:productId
 * @access  Private Admin/Owner
 */
export const updateProduct = asyncHandler(async (req, res) => {
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
  const isAdmin =
    userRole === "admin" || req.user?.permissions?.includes("products.viewAll");

  if (!isOwner && !isAdmin) {
    throw new AppError(tAlerts("unauthorized") || "Unauthorized", 403);
  }

  const data = { ...req.body };

  let updatedImages = product.images;
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imagesToDelete = product.images;
    const newImages = (req.files as Express.Multer.File[]).map(
      (file) => file.path,
    );

    const cloudinary = (await import("../../utils/config/cloudinary.js")).default;
    const deletePromises = imagesToDelete.map(async (imageUrl: string) => {
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
    updatedImages = newImages;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { ...data, images: updatedImages },
    { new: true, runValidators: true },
  ).select("-__v");

  sendResponse(
    res,
    200,
    tAlerts("product_updated_successfully") || "Product updated successfully",
    updatedProduct,
  );
});
