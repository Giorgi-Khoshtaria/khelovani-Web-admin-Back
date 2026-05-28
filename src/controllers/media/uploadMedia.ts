import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import cloudinary from "../../utils/config/cloudinary.js";
import { toMediaItem } from "./mediaHelpers.js";

/**
 * @desc    Upload one or more media assets into an organisation folder.
 * @route   POST /api/admin/media?orgId=<id>
 * @access  Admin / Organisation (own folder only)
 *
 * The destination folder is resolved by `setMediaFolder` middleware and
 * applied by multer-storage-cloudinary, so by the time we get here the
 * file(s) already live in khelovani/organizations/<orgId>.
 */
export const uploadMedia = asyncHandler(async (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  const single = req.file ? [req.file] : [];
  const uploaded = [...files, ...single];

  if (uploaded.length === 0) {
    throw new AppError("ფაილი არ არის ატვირთული", 422);
  }

  // multer-storage-cloudinary exposes the created resource on the file object;
  // re-fetch from Cloudinary to get a consistent shape for every field.
  const items = await Promise.all(
    uploaded.map(async (file: any) => {
      const publicId = file.filename || file.public_id;
      try {
        const resource = await cloudinary.api.resource(publicId);
        return toMediaItem(resource);
      } catch {
        // Fall back to whatever multer gave us.
        return toMediaItem({
          public_id: publicId,
          secure_url: file.path,
          format: file.format,
          bytes: file.size,
          created_at: new Date().toISOString(),
        });
      }
    }),
  );

  sendResponse(res, 201, "ფაილ(ებ)ი წარმატებით აიტვირთა", { items });
});
