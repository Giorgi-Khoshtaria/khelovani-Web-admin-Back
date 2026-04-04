import { Request, Response } from "express";
import MenuItem from "../../../modules/menu.modules.js";
import { validateMenuItem } from "../../../validations/forms/menuValidation.js";
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
    const { id } = req.params;
    const { label, href, order, isActive } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const validationErrors = validateMenuItem(req.body, lang);
    if (Object.keys(validationErrors).length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    const item = await MenuItem.findByIdAndUpdate(
      id,
      { label, href, order: Number(order), isActive },
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
    res.status(500).json({ message: (error as Error).message });
  }
};
