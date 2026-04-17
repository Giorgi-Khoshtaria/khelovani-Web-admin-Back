import mongoose from "mongoose";
import MenuItem from "../../../modules/menu.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Delete menu item
 * @route   DELETE /api/admin/menu/:id
 * @access  Private Admin
 */
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(
      tAlerts("invalid_menu_item_id") || "Invalid menu item ID",
      422,
    );
  }

  const item = await MenuItem.findByIdAndDelete(id);

  if (!item) {
    throw new AppError(tAlerts("menu_item_not_found"), 404);
  }

  sendResponse(
    res,
    200,
    tAlerts("menu_item_deleted_success") || "Menu item deleted successfully",
  );
});
