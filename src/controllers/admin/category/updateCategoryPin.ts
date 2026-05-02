import mongoose from "mongoose";
import Category from "../../../modules/category.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

const PIN_CAP = 4;

/**
 * @desc    Pin or unpin a category (max 4 pinned; FIFO eviction)
 * @route   PATCH /api/admin/categories/:id/pin
 * @access  Private Admin
 */
export const updateCategoryPin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPinned } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid category id", 422);
  }

  if (!isPinned) {
    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: { isPinned: false, pinnedAt: null } },
      { new: true },
    );

    if (!updated) throw new AppError("Category not found", 404);

    return sendResponse(res, 200, "Category unpinned", updated, { evicted: [] });
  }

  const session = await mongoose.startSession();
  let result: any;
  let evicted: string[] = [];

  try {
    await session.withTransaction(async () => {
      const target = await Category.findById(id).session(session);
      if (!target) throw new AppError("Category not found", 404);

      if (target.isPinned) {
        result = await Category.findById(id).session(session);
        return;
      }

      const pinnedCount = await Category.countDocuments({ isPinned: true }).session(session);

      if (pinnedCount >= PIN_CAP) {
        const toEvict = await Category.find({ isPinned: true })
          .sort({ pinnedAt: 1 })
          .limit(pinnedCount - PIN_CAP + 1)
          .select("_id")
          .session(session);

        evicted = toEvict.map((d) => String(d._id));

        await Category.updateMany(
          { _id: { $in: evicted } },
          { $set: { isPinned: false, pinnedAt: null } },
          { session },
        );
      }

      result = await Category.findByIdAndUpdate(
        id,
        { $set: { isPinned: true, pinnedAt: new Date() } },
        { new: true, session },
      );
    });
  } finally {
    session.endSession();
  }

  sendResponse(res, 200, "Category pinned", result, { evicted });
});
