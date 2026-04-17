import MenuItem from "../../../modules/menu.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";

/**
 * @desc    Create menu item
 * @route   POST /api/admin/menu
 * @access  Private Admin
 */
export const createMenuItem = asyncHandler(async (req, res) => {
  const { label, href, order, isActive } = req.body;

  const itemData: any = {
    label,
    href,
    isActive,
  };
  if (order !== undefined) {
    itemData.order = Number(order);
  }

  const item = await MenuItem.create(itemData);
  sendResponse(res, 201, "Menu item created successfully", item);
});
