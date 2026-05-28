import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, getCloudinaryPublicId } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { isPinSectionCompatible } from "../../utils/pinCompatibility.js";
import { invalidateProductById } from "../../utils/cache/invalidators.js";

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

  let keepImages: string[] | null = null;
  if (data.keepImages !== undefined) {
    try {
      const parsed = typeof data.keepImages === "string" ? JSON.parse(data.keepImages) : data.keepImages;
      if (Array.isArray(parsed)) {
        keepImages = parsed.filter((u): u is string => typeof u === "string");
      }
    } catch {
      keepImages = null;
    }
    delete data.keepImages;
  }

  const filesDict = req.files as Record<string, Express.Multer.File[]> | undefined;
  const newImageFiles = filesDict?.["images"];
  const hasNewFiles = !!(newImageFiles && newImageFiles.length > 0);

  let updatedImages = product.images;

  if (hasNewFiles || keepImages !== null) {
    const survivors = keepImages !== null
      ? product.images.filter((url: string) => keepImages!.includes(url))
      : product.images;
    const imagesToDelete = product.images.filter((url: string) => !survivors.includes(url));
    const newImageUrls = hasNewFiles ? newImageFiles!.map((file) => file.path) : [];

    if (imagesToDelete.length > 0) {
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
    }

    updatedImages = [...survivors, ...newImageUrls];
  }

  // Auto-unpin if the section is no longer compatible after this update
  const mergedData = { ...product.toObject(), ...data };
  if (
    product.pinSection &&
    !isPinSectionCompatible(product.pinSection, mergedData)
  ) {
    data.pinSection = null;
    data.pinnedAt = null;
    console.info(
      `[pin] auto-unpinned product ${productId} from section "${product.pinSection}" after field update`,
    );
  }

  // Auto-clear sale when isShown toggled off
  if (data.isShown === false && product.pinSection) {
    data.pinSection = null;
    data.pinnedAt = null;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { ...data, images: updatedImages },
    { new: true, runValidators: true },
  ).select("-__v");

  invalidateProductById(productId as string);

  sendResponse(
    res,
    200,
    tAlerts("product_updated_successfully") || "Product updated successfully",
    updatedProduct,
  );
});
