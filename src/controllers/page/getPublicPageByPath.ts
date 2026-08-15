import Page from "../../modules/page.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    GET a page's SEO content by its route path (Public — for web frontend)
 * @route   GET /api/pages?path=/about
 * @access  Public
 */
export const getPublicPageByPath = asyncHandler(async (req, res) => {
  const path = req.query.path as string;

  if (!path) {
    throw new AppError("path is required", 422);
  }

  const item = await Page.findOne({ path });

  if (!item) {
    throw new AppError("Page not found", 404);
  }

  sendResponse(res, 200, "Page retrieved successfully", item);
});
