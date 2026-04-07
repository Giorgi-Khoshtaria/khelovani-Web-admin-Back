import mongoose from "mongoose";
import { Request, Response } from "express";
import MenuItem from "../../../modules/menu.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Delete menu item
// @route   DELETE /api/admin/menu/:id
// @access  Private Admin
export const deleteMenuItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(422).json({
        errors: [{
          field: "id",
          message: tAlerts("invalid_menu_item_id") || "Invalid menu item ID"
        }],
      });
      return;
    }

    const item = await MenuItem.findByIdAndDelete(id);

    if (!item) {
      res.status(404).json({
        message: tAlerts("menu_item_not_found"),
      });
      return;
    }

    res.status(200).json({
      message: tAlerts("menu_item_deleted_success"),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
