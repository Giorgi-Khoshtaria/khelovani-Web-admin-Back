import Page from "../../../modules/page.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";

/**
 * @desc    Get all pages (Admin)
 * @route   GET /api/admin/pages
 * @access  Private Admin
 */
export const getPages = asyncHandler(async (_req, res) => {
  const items = await Page.find().sort({ path: 1 });
  sendResponse(res, 200, "Pages retrieved successfully", items);
});
