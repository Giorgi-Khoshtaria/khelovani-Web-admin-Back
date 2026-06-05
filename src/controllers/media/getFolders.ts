import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import cloudinary from "../../utils/config/cloudinary.js";
import { CLOUDINARY_ROOT } from "../../utils/config/mediaFolders.js";

// Hidden from the Media Manager (user avatars are managed elsewhere).
const HIDDEN_FOLDERS = new Set(["users"]);
/**
 * @desc    List top-level media folders under the khelovani root (admin only).
 * @route   GET /api/admin/media/folders
 * @access  Admin — media.view
 *
 * Powers the Media Manager folder filter, e.g. "general", "organizations",
 * "products". Returns an empty list (not an error) if the root doesn't exist.
 */
export const getFolders = asyncHandler(async (_req, res) => {
  let folders: { name: string; path: string }[] = [];

  try {
    const result = await cloudinary.api.sub_folders(CLOUDINARY_ROOT);
    folders = (result.folders || [])
      .map((f: { name: string; path: string }) => ({
        name: f.name,
        path: f.path,
      }))
      .filter((f: { name: string }) => !HIDDEN_FOLDERS.has(f.name));
  } catch (err) {
    // Cloudinary throws 404 when the root folder has no assets yet.
    const status = (err as { http_code?: number })?.http_code;
    if (status !== 404) throw err;
  }

  sendResponse(res, 200, "ფოლდერები ჩაიტვირთა", folders);
});
