import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import cloudinary from "../../utils/config/cloudinary.js";
import { assertCanMutate, toMediaItem } from "./mediaHelpers.js";
import { remapMediaReference } from "./mediaDbSync.js";

/** Keep file names URL-safe; spaces become underscores. */
const sanitizeName = (raw: string): string =>
  raw
    .trim()
    .replace(/\.[a-z0-9]+$/i, "") // strip any extension the user typed
    .replace(/[^\p{L}\p{N}_-]+/gu, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);

/**
 * @desc    Rename a media asset (changes the file name, keeps the folder).
 * @route   PUT /api/admin/media/rename
 * @access  Admin / Organisation (own folder only)
 */
export const renameMedia = asyncHandler(async (req, res) => {
  const { publicId, newName } = req.body as {
    publicId?: string;
    newName?: string;
  };

  if (!publicId) {
    throw new AppError("ფაილი მითითებული არ არის", 422);
  }
  if (!newName || !newName.trim()) {
    throw new AppError("ახალი სახელი სავალდებულოა", 422);
  }

  assertCanMutate(req, publicId);

  const safeName = sanitizeName(newName);
  if (!safeName) {
    throw new AppError("არასწორი ფაილის სახელი", 422);
  }

  const lastSlash = publicId.lastIndexOf("/");
  const folder = lastSlash >= 0 ? publicId.slice(0, lastSlash) : "";
  const targetPublicId = folder ? `${folder}/${safeName}` : safeName;

  if (targetPublicId === publicId) {
    throw new AppError("ფაილს უკვე აქვს ეს სახელი", 422);
  }

  let result;
  try {
    result = await cloudinary.uploader.rename(publicId, targetPublicId, {
      overwrite: false,
      invalidate: true,
    });
  } catch (err: any) {
    if (err?.http_code === 409 || /already exists/i.test(err?.message || "")) {
      throw new AppError("ამ სახელით ფაილი უკვე არსებობს", 409);
    }
    throw err;
  }

  // Renaming changes the delivery URL — repoint any DB references
  // (product images, organisation photos) to the new URL.
  const item = toMediaItem(result);
  const synced = await remapMediaReference(publicId, item.url);

  sendResponse(res, 200, "ფაილის სახელი წარმატებით შეიცვალა", {
    item,
    dbSync: synced,
  });
});
