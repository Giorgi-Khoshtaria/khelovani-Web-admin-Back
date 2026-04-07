import { Request, Response } from "express";
import MenuItem from "../../../modules/menu.modules.js";
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

    const itemData: any = {
      label,
      href,
      isActive,
    };
    if (order !== undefined) {
      itemData.order = Number(order);
    }

    const item = await MenuItem.create(itemData);
    res.status(201).json(item);
  } catch (error) {
    if (
      (error as any).name === "ValidationError" ||
      (error as any).name === "CastError"
    ) {
      res.status(422).json({
        errors: [{ field: "database", message: (error as Error).message }],
      });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
  }
};
