import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public/Private
export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const partnerId = req.params.id;
    const userRole = req.user?.role?.toLowerCase();
    const userId = req.user?.id;

    const { search, category, partnerId: queryPartnerId } = req.query;

    let query: any = {};

    // Use partnerId from params (/:id/products) or query (?partnerId=...)
    const targetPartnerId = partnerId || queryPartnerId;
    const isAdmin =
      userRole === "admin" ||
      userRole === "super_admin" ||
      req.user?.permissions?.includes("products.viewAll");

    if (targetPartnerId) {
      if (!mongoose.Types.ObjectId.isValid(targetPartnerId as string)) {
        res.status(400).json({ message: "Invalid partner ID format" });
        return;
      }
      if (!isAdmin && targetPartnerId !== userId) {
        res.status(403).json({ message: "Forbidden: Cannot access another partner's products" });
        return;
      }
      query.owner = targetPartnerId;
    }
    // If no partnerId, and it's not an admin, filter by the logged-in user's products
    else if (!isAdmin) {
      query.owner = userId;
    }
    // If it's an admin and no partnerId, query remains empty {} to fetch all

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [
        { titleGe: searchRegex },
        { titleEn: searchRegex },
        { descriptionGe: searchRegex },
        { descriptionEn: searchRegex },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).select("-__v");

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};
