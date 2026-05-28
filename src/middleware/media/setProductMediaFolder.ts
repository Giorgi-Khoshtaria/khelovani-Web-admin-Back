import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";
import { orgFolderRelative } from "../../utils/config/mediaFolders.js";

/**
 * Resolve the destination Cloudinary folder for a product update by reading
 * the product's owner (orgId), so new images land in the org's media folder
 * rather than the generic fallback. Must run BEFORE multer.
 */
export const setProductMediaFolder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const productId = req.params.productId;

  if (typeof productId !== "string" || !mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ message: "არასწორი პროდუქტის ID" });
    return;
  }

  const product = await Product.findById(productId).select("owner").lean();
  if (!product) {
    res.status(404).json({ message: "პროდუქტი ვერ მოიძებნა" });
    return;
  }

  (req as any).cloudinaryFolder = orgFolderRelative(product.owner.toString());
  next();
};
