import type { Request, Response } from "express";
import Role from "../../../modules/role.modules.js";

// @desc    Get all roles (with search & pagination)
// @route   GET /api/admin/roles
// @access  Private Admin
export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, panel, page = 1, limit = 100 } = req.query;

    const query: any = {};

    // 1. Case-insensitive search by name
    if (search) {
      query.name = { $regex: String(search), $options: "i" };
    }

    // 2. Filter by panel
    if (panel) {
      query.allowedPanels = String(panel);
    }

    const skip = Math.max(0, (Number(page) - 1) * Number(limit));

    const roles = await Role.find(query)
      .populate("permissions")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
