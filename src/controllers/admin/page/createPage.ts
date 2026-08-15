import Page from "../../../modules/page.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { invalidatePage } from "../../../utils/cache/invalidators.js";

/**
 * @desc    Create page
 * @route   POST /api/admin/pages
 * @access  Private Admin
 */
export const createPage = asyncHandler(async (req, res) => {
  const { path, title, description, ogImage, noindex } = req.body;

  const item = await Page.create({ path, title, description, ogImage, noindex });
  void invalidatePage();
  sendResponse(res, 201, "Page created successfully", item);
});
