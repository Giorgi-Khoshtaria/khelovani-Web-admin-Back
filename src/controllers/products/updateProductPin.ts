import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { PIN_CAP_PER_SECTION, type PinSection } from "../../types/productPin.js";
import { isPinSectionCompatible } from "../../utils/pinCompatibility.js";
import { invalidateProducts } from "../../utils/cache/invalidators.js";

/**
 * @desc    Pin or unpin a product per section (max 4 per section; FIFO eviction)
 * @route   PATCH /api/products/:productId/pin
 * @access  Private Admin
 * @body    { pinSection: "regular" | "new" | "sale" | "oneOfAKind" | null }
 */
export const updateProductPin = asyncHandler(async (req, res) => {
  const productId = req.params.productId as string;
  const { pinSection } = req.body as { pinSection: PinSection | null };

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid product id", 422);
  }

  // ── Unpin ─────────────────────────────────────────────────
  if (pinSection === null) {
    const updated = await Product.findByIdAndUpdate(
      productId,
      { $set: { pinSection: null, pinnedAt: null } },
      { new: true },
    );
    if (!updated) throw new AppError("Product not found", 404);
    void invalidateProducts();
    return sendResponse(res, 200, "Product unpinned", updated, { evicted: [] });
  }

  // ── Pin ───────────────────────────────────────────────────
  const session = await mongoose.startSession();
  let result: any;
  let evicted: string[] = [];

  try {
    await session.withTransaction(async () => {
      const target = await Product.findById(productId).session(session);
      if (!target) throw new AppError("Product not found", 404);

      if (!target.isShown) throw new AppError("Cannot pin a hidden product", 422);

      if (!isPinSectionCompatible(pinSection, target)) {
        throw new AppError("pin_section_incompatible", 400);
      }

      // Already pinned to this same section — no-op
      if (target.pinSection === pinSection) {
        result = target;
        return;
      }

      const sectionCount = await Product.countDocuments({ pinSection }).session(session);

      if (sectionCount >= PIN_CAP_PER_SECTION) {
        const toEvict = await Product.find({ pinSection })
          .sort({ pinnedAt: 1 })
          .limit(sectionCount - PIN_CAP_PER_SECTION + 1)
          .select("_id")
          .session(session);

        evicted = toEvict.map((d) => String(d._id));

        await Product.updateMany(
          { _id: { $in: evicted } },
          { $set: { pinSection: null, pinnedAt: null } },
          { session },
        );
      }

      result = await Product.findByIdAndUpdate(
        productId,
        { $set: { pinSection, pinnedAt: new Date() } },
        { new: true, session },
      );
    });
  } finally {
    session.endSession();
  }

  void invalidateProducts();

  sendResponse(res, 200, "Product pinned", result, { evicted });
});
