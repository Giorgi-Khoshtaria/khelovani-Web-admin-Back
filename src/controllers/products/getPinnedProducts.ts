import Product from "../../modules/product.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

/**
 * @desc    Get pinned products for home page (max 4)
 * @route   GET /api/products/pinned
 * @access  Public
 */
export const getPinnedProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find({
    isShown: true,
    isPinned: true,
  })
    .sort({ pinnedAt: -1 })
    .limit(4);

  sendResponse(res, 200, "Pinned products retrieved successfully", products);
});
