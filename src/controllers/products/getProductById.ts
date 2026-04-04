import { Request, Response } from "express";
import Product from "../../modules/product.modules.js";

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

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const isAdmin =
      userRole === "admin" ||
      userRole === "super_admin" ||
      req.user?.permissions?.includes("products.viewAll");

    // Role-based access check
    if (!isAdmin && product.owner.toString() !== userId) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product details" });
  }
};
