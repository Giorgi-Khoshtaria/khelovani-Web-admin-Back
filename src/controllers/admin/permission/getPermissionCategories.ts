import Permission from "../../../modules/permission.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";

// @desc    Get all distinct permission categories
// @route   GET /api/admin/permissions/categories
export const getPermissionCategories = asyncHandler(async (_req, res) => {
  const categories = await Permission.distinct("category");
  sendResponse(res, 200, "Categories fetched successfully", (categories as string[]).sort());
});
