import MenuItem from "../../../modules/menu.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";

/**
 * @desc    Get all menu items (Admin - includes inactive)
 * @route   GET /api/admin/menu
 * @access  Private Admin
 */
export const getMenuItems = asyncHandler(async (_req, res) => {
  const items = await MenuItem.find().sort({ order: 1 });
  sendResponse(res, 200, "Menu items retrieved successfully", items);
});
