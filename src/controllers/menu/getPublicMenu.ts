import MenuItem from "../../modules/menu.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

/**
 * @desc    GET active menu items (Public — for web frontend)
 * @route   GET /api/menu
 * @access  Public
 */
export const getPublicMenuItems = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({ isActive: true }).sort({ order: 1 });
  sendResponse(res, 200, "Public menu retrieved successfully", items);
});
