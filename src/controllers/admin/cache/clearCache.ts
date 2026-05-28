import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import {
  invalidateTranslations,
  invalidateCategories,
  invalidateMenu,
  invalidateProducts,
  invalidatePartners,
} from "../../../utils/cache/invalidators.js";

/**
 * @desc    Flush all application cache domains
 * @route   DELETE /api/admin/cache
 * @access  Private Admin — requires settings.edit permission
 */
export const clearCache = asyncHandler(async (_req, res) => {
  await Promise.all([
    invalidateTranslations(),
    invalidateCategories(),
    invalidateMenu(),
    invalidateProducts(),
    invalidatePartners(),
  ]);

  sendResponse(res, 200, "Cache cleared successfully");
});
