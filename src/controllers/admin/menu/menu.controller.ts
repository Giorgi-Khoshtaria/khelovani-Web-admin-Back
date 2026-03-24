import { Request, Response } from "express";
import MenuItem from "../../../modules/menu.modules.js";
import { validateMenuItem } from "../../../validations/forms/menuValidation.js";

// ── GET all menu items (Admin - includes inactive) ──────────────────────────
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

// ── POST create menu item ────────────────────────────────────────────────────
export const createMenuItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { label, href, order, isActive } = req.body;

    const validationErrors = validateMenuItem(req.body);
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

// ── PUT update menu item ─────────────────────────────────────────────────────
export const updateMenuItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { label, href, order, isActive } = req.body;

    const validationErrors = validateMenuItem(req.body);
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
      res.status(404).json({ message: "Menu item not found" });
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ── DELETE menu item ─────────────────────────────────────────────────────────
export const deleteMenuItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByIdAndDelete(id);

    if (!item) {
      res.status(404).json({ message: "Menu item not found" });
      return;
    }

    res.status(200).json({ message: "menu_item_deleted" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
