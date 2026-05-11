import mongoose from "mongoose";
import MenuItem from "../../../modules/menu.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { invalidateMenu } from "../../../utils/cache/invalidators.js";

/**
 * @desc    Update menu item
 * @route   PUT /api/admin/menu/:id
 * @access  Private Admin
 */
export const updateMenuItem = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(
      tAlerts("invalid_menu_item_id") || "Invalid menu item ID",
      422,
    );
  }

  const { label, href, order, isActive } = req.body;
  const updateData: Record<string, any> = {};
  if (label !== undefined) updateData.label = label;
  if (href !== undefined) updateData.href = href;
  if (order !== undefined) updateData.order = Number(order);
  if (isActive !== undefined) updateData.isActive = isActive;

  const item = await MenuItem.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    throw new AppError(tAlerts("menu_item_not_found"), 404);
  }

  void invalidateMenu();
  sendResponse(res, 200, "Menu item updated successfully", item);
});
