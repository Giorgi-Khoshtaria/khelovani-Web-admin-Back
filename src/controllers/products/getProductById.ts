import { Request, Response } from "express";
import Product from "../../modules/product.modules.js";

import mongoose from "mongoose";

// @desc    Get single product by ID
// @route   GET /api/products/:productId
export const getProductById = async (
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

    const product = await Product.findById(productId as string).select("-__v");

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Authorization: owner can see it, admin can see it, partner must be owner
    const isOwner = product.owner.toString() === userId;
    const isAdmin =
      userRole === "admin" ||
      userRole === "super_admin" ||
      req.user?.permissions?.includes("products.viewAll");

    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product details" });
  }
};
