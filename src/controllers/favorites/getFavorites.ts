import Favorite from "../../modules/favorite.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { getCategoryPlaceholder } from "../../utils/imageFallback.js";

const ALLOWED_SORT: Record<string, Record<string, 1 | -1>> = {
  recent: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

/**
 * @desc    Get all favorites for the current user with derived stats
 * @route   GET /api/favorites
 * @access  Private (user)
 *
 * Supports ?category=Ceramics, ?sort=recent|oldest|priceAsc|priceDesc.
 * Price sorts run after the join so they reflect current product price.
 */
export const getFavorites = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const { category, sort } = req.query;
  const sortParam = typeof sort === "string" ? sort : "recent";
  const baseSort = ALLOWED_SORT[sortParam] ?? ALLOWED_SORT.recent;

  const favorites = await Favorite.find({ user: req.user.id })
    .sort(baseSort)
    .populate({
      path: "product",
      populate: { path: "owner", select: "companyNameGe companyNameEn" },
    })
    .lean();

  // Drop favorites whose product was deleted; surface the rest with derived flags.
  const items = favorites
    .filter((f: any) => f.product)
    .map((f: any) => {
      const product = f.product;
      if (!product.images || product.images.length === 0) {
        product.images = [getCategoryPlaceholder(product.category)];
      }
      return {
        _id: f._id,
        savedAt: f.createdAt,
        priceAtSave: f.priceAtSave,
        priceDropped: product.price < f.priceAtSave,
        product,
      };
    });

  let filtered = items;
  if (category && category !== "all" && typeof category === "string") {
    const re = new RegExp(`^${escapeRegex(category)}(_|$)`, "i");
    filtered = items.filter((i) => re.test(i.product.category));
  }

  if (sortParam === "priceAsc") {
    filtered.sort((a, b) => a.product.price - b.product.price);
  } else if (sortParam === "priceDesc") {
    filtered.sort((a, b) => b.product.price - a.product.price);
  }

  const categoryCounts: Record<string, number> = {};
  for (const i of items) {
    const cat = String(i.product.category || "").split("_")[0];
    if (!cat) continue;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const stats = {
    total: items.length,
    priceDrops: items.filter((i) => i.priceDropped).length,
    totalValue: items.reduce((sum, i) => sum + (i.product.price || 0), 0),
    categories: categoryCounts,
  };

  sendResponse(res, 200, "Favorites retrieved", filtered, { stats });
});
