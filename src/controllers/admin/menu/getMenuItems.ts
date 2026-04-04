import { Request, Response } from "express";
import MenuItem from "../../../modules/menu.modules.js";

// @desc    Get all menu items (Admin - includes inactive)
// @route   GET /api/admin/menu
// @access  Private Admin
export const getMenuItems = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const items = await MenuItem.find().sort({ order: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
