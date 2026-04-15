import { Request, Response } from "express";
import Product from "../../modules/product.modules.js";

import mongoose from "mongoose";

// @desc    Delete a product
// @route   DELETE /api/products/:productId
export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { productId } = req.params;
    const userRole = req.user?.role?.toLowerCase();
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(productId as string)) {
      res.status(400).json({ message: "Invalid product ID format" });
      return;
    }

    const product = await Product.findById(productId as string);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const isAdmin =
      userRole === "admin" ||
      req.user?.permissions?.includes("products.viewAll");

    // Authorization: Admin can delete any product, Partner only their own
    if (!isAdmin && product.owner.toString() !== userId) {
      res.status(403).json({ message: "Unauthorized to delete this product" });
      return;
    }

    // Delete images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(async (imageUrl: string) => {
        try {
          const parts = imageUrl.split("/");
          const fileNameWithExt = parts.pop();
          const folderName = parts.pop();

          if (fileNameWithExt && folderName) {
            const publicId = `${folderName}/${fileNameWithExt.split(".")[0]}`;
            // @ts-ignore - cloudinary import is default
            const result = await (
              await import("../../utils/config/cloudinary.js")
            ).default.uploader.destroy(publicId);
            return result;
          }
        } catch (err) {
          console.error("Cloudinary delete error for:", imageUrl, err);
        }
      });
      await Promise.all(deletePromises);
    }

    await Product.deleteOne({ _id: productId });

    res.status(200).json({ message: "პროდუქტი წარმატებით წაიშალა" });
  } catch (error) {
    console.error("DELETE_PRODUCT_ERROR:", error);
    res.status(500).json({ message: "შეცდომა პროდუქტის წაშლისას" });
  }
};
