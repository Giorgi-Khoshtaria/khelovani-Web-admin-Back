import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

const PIN_CAP = 4;

/**
 * @desc    Pin or unpin a product (max 4 pinned; FIFO eviction)
 * @route   PATCH /api/products/:productId/pin
 * @access  Private Admin
 */
export const updateProductPin = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { isPinned } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid product id", 422);
  }

  if (!isPinned) {
    const updated = await Product.findByIdAndUpdate(
      productId,
      { $set: { isPinned: false, pinnedAt: null } },
      { new: true },
    );

    if (!updated) throw new AppError("Product not found", 404);

    return sendResponse(res, 200, "Product unpinned", updated, { evicted: [] });
  }

  const session = await mongoose.startSession();
  let result: any;
  let evicted: string[] = [];

  try {
    await session.withTransaction(async () => {
      const target = await Product.findById(productId).session(session);
      if (!target) throw new AppError("Product not found", 404);

      if (!target.isShown) throw new AppError("Cannot pin a hidden product", 422);

      if (target.isPinned) {
        result = await Product.findById(productId).session(session);
        return;
      }

      const pinnedCount = await Product.countDocuments({ isPinned: true }).session(session);

      if (pinnedCount >= PIN_CAP) {
        const toEvict = await Product.find({ isPinned: true })
          .sort({ pinnedAt: 1 })
          .limit(pinnedCount - PIN_CAP + 1)
          .select("_id")
          .session(session);

        evicted = toEvict.map((d) => String(d._id));

        await Product.updateMany(
          { _id: { $in: evicted } },
          { $set: { isPinned: false, pinnedAt: null } },
          { session },
        );
      }

      result = await Product.findByIdAndUpdate(
        productId,
        { $set: { isPinned: true, pinnedAt: new Date() } },
        { new: true, session },
      );
    });
  } finally {
    session.endSession();
  }

  sendResponse(res, 200, "Product pinned", result, { evicted });
});
