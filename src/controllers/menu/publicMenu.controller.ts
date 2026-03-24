import { Request, Response } from "express";
import MenuItem from "../../modules/menu.modules.js";

// ── GET active menu items (Public — for web frontend) ────────────────────────
export const getPublicMenuItems = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const items = await MenuItem.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
