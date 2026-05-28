import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import cloudinary from "../../utils/config/cloudinary.js";
import { assertCanMutate } from "./mediaHelpers.js";
import { purgeMediaReferences } from "./mediaDbSync.js";

/**
 * @desc    Delete one or more media assets.
 * @route   DELETE /api/admin/media
 * @access  Admin / Organisation (own folder only)
 *
 * Accepts a single `publicId` or an array `publicIds` in the request body.
 */
export const deleteMedia = asyncHandler(async (req, res) => {
  const { publicId } = req.body as { publicId?: string };
  const publicIds: string[] = Array.isArray(req.body?.publicIds)
    ? req.body.publicIds
    : publicId
      ? [publicId]
      : [];

  if (publicIds.length === 0) {
    throw new AppError("წასაშლელი ფაილი მითითებული არ არის", 422);
  }
  if (publicIds.length > 50) {
    throw new AppError("ერთ ჯერზე მაქსიმუმ 50 ფაილის წაშლაა შესაძლებელი", 422);
  }

  // Ownership check for every asset before deleting anything.
  publicIds.forEach((id) => assertCanMutate(req, id));

  const result = await cloudinary.api.delete_resources(publicIds);

  // Keep the database in sync — drop references to the now-deleted files
  // from product images and organisation profile photos.
  const synced = await purgeMediaReferences(publicIds);

  sendResponse(res, 200, "ფაილ(ებ)ი წარმატებით წაიშალა", {
    deleted: result.deleted || {},
    dbSync: synced,
  });
});
