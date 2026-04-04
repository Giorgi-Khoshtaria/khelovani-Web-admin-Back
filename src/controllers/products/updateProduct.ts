import { Request, Response } from "express";
import Product from "../../modules/product.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { customParse } from "./product.utils.js";

// @desc    Update a product
// @route   PUT /api/products/:productId
export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const { productId } = req.params;
    const userRole = req.user?.role?.toLowerCase();
    const userId = req.user?.id;

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Authorization: owner can edit everything, admin can only toggle isShown
    const isOwner = product.owner.toString() === userId;
    const isAdmin =
      userRole === "admin" ||
      userRole === "super_admin" ||
      req.user?.permissions?.includes("products.viewAll");

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    // If role is admin, they can ONLY update isShown
    if (userRole === "admin") {
      const isShown = customParse(req.body.isShown);
      if (isShown === undefined) {
        res.status(400).json({ message: "isShown field is required" });
        return;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { isShown },
        { new: true },
      );
      res.status(200).json({
        message:
          tAlerts("product_updated_successfully") ||
          "Product updated successfully",
        product: updatedProduct,
      });
      return;
    }

    const data = req.body;
    const fieldsToParse = [
      "tagsGe",
      "tagsEn",
      "materialsGe",
      "materialsEn",
      "isOneOfAKind",
      "shippingAvailable",
      "isShown",
    ];
    const numericFields = ["price", "stockQuantity", "shippingPrice", "weight"];

    fieldsToParse.forEach((field) => {
      if (data[field] !== undefined) data[field] = customParse(data[field]);
    });

    numericFields.forEach((field) => {
      if (data[field] !== undefined) data[field] = Number(data[field]);
    });

    let updatedImages = product.images;
    if (
      req.files &&
      "images" in req.files &&
      (req.files as any).images.length > 0
    ) {
      const imagesToDelete = product.images;
      const newImages = (req.files as any).images.map((file: any) => file.path);

      const cloudinary = (await import("../../utils/config/cloudinary.js"))
        .default;
      const deletePromises = imagesToDelete.map(async (imageUrl: string) => {
        try {
          const parts = imageUrl.split("/");
          const fileNameWithExt = parts.pop();
          const folderName = parts.pop();
          if (fileNameWithExt && folderName) {
            const publicId = `${folderName}/${fileNameWithExt.split(".")[0]}`;
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
    );

    res.status(200).json({
      message:
        tAlerts("product_updated_successfully") ||
        "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR:", error);
    res.status(500).json({ message: (error as Error).message });
  }
};
