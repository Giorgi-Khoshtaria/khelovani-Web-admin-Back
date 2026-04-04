import { Request, Response } from "express";
import MenuItem from "../../../modules/menu.modules.js";
import { validateMenuItem } from "../../../validations/forms/menuValidation.js";
import { Lang } from "../../../types/lang.types.js";

// @desc    Create menu item
// @route   POST /api/admin/menu
// @access  Private Admin
export const createMenuItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { label, href, order, isActive } = req.body;
    const lang = (req.query.lang as Lang) || "ge";

    const validationErrors = validateMenuItem(req.body, lang);
    if (Object.keys(validationErrors).length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    const item = await MenuItem.create({
      label,
      href,
      order: Number(order),
      isActive,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
