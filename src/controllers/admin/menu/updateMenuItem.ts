import mongoose from "mongoose";
import { Request, Response } from "express";
import MenuItem from "../../../modules/menu.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Update menu item
// @route   PUT /api/admin/menu/:id
// @access  Private Admin
export const updateMenuItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { label, href, order, isActive } = req.body;
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

    const updateData: any = { ...req.body };
    if (req.body.order !== undefined) {
      updateData.order = Number(req.body.order);
    }

    const item = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!item) {
      res.status(404).json({
        message: tAlerts("menu_item_not_found"),
      });
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    if ((error as any).name === "ValidationError" || (error as any).name === "CastError") {
      res.status(422).json({
        errors: [{ field: "database", message: (error as Error).message }],
      });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
  }
};
