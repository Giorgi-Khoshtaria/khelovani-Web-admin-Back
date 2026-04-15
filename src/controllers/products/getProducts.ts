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

    const {
      search,
      category,
      partnerId: queryPartnerId,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    let query: any = {};

    // Use partnerId from params (/:id/products) or query (?partnerId=...)
    const targetPartnerId = partnerId || queryPartnerId;
    const isAdmin =
      userRole === "admin" ||
      req.user?.permissions?.includes("products.viewAll");

    if (targetPartnerId) {
      if (!mongoose.Types.ObjectId.isValid(targetPartnerId as string)) {
        res.status(400).json({ message: "Invalid partner ID format" });
        return;
      }
      // If filtering by partner, must be admin or the partner themselves
      if (!isAdmin && targetPartnerId !== userId) {
        res
          .status(403)
          .json({
            message: "Forbidden: Cannot access another partner's products",
          });
        return;
      }
      query.owner = targetPartnerId;
    }
    // Public view or general authenticated view
    else {
      // If not an admin, we only show public products by default
      // UNLESS a partner is logged in and specifically browsing their own space (handled via targetPartnerId above)
      if (!isAdmin) {
        query.isShown = true;
      }
      // Admins get to see everything if they don't provide a targetPartnerId
    }

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

    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNumber);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .select("-__v");

    res.status(200).json({
      products,
      totalCount,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("GetProducts Error:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};
