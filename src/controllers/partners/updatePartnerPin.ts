import mongoose from "mongoose";
import Organisation from "../../modules/organization.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { invalidatePartners } from "../../utils/cache/invalidators.js";

const PIN_CAP = 7;

/**
 * @desc    Pin or unpin a partner (max 7 pinned; FIFO eviction)
 * @route   PATCH /api/admin/partners/:id/pin
 * @access  Private Admin
 */
export const updatePartnerPin = asyncHandler(async (req, res) => {
  const id = req.params.id as string;
  const { isPinned } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid partner id", 422);
  }

  if (!isPinned) {
    const updated = await Organisation.findByIdAndUpdate(
      id,
      { $set: { isPinned: false, pinnedAt: null } },
      { new: true },
    ).select("-password");

    if (!updated) throw new AppError("Partner not found", 404);

    void invalidatePartners();
    return sendResponse(res, 200, "Partner unpinned", updated, { evicted: [] });
  }

  const session = await mongoose.startSession();
  let result: any;
  let evicted: string[] = [];

  try {
    await session.withTransaction(async () => {
      const target = await Organisation.findById(id).session(session);
      if (!target) throw new AppError("Partner not found", 404);

      if (target.isPinned) {
        result = await Organisation.findById(id).select("-password").session(session);
        return;
      }

      const pinnedCount = await Organisation.countDocuments({ isPinned: true }).session(session);

      if (pinnedCount >= PIN_CAP) {
        const toEvict = await Organisation.find({ isPinned: true })
          .sort({ pinnedAt: 1 })
          .limit(pinnedCount - PIN_CAP + 1)
          .select("_id")
          .session(session);

        evicted = toEvict.map((d) => String(d._id));

        await Organisation.updateMany(
          { _id: { $in: evicted } },
          { $set: { isPinned: false, pinnedAt: null } },
          { session },
        );
      }

      result = await Organisation.findByIdAndUpdate(
        id,
        { $set: { isPinned: true, pinnedAt: new Date() } },
        { new: true, session },
      ).select("-password");
    });
  } finally {
    session.endSession();
  }

  void invalidatePartners();
  sendResponse(res, 200, "Partner pinned", result, { evicted });
});
