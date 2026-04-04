import type { Request, Response } from "express";
import Permission from "../../../modules/permission.modules.js";
import { Lang } from "../../../types/lang.types.js";

// @desc    Get all permissions (with Pagination)
// @route   GET /api/admin/permissions
export const getPermissions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { search, category, page = "1", limit = "100" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 100);
    const skip = (pageNum - 1) * limitNum;

    let query: any = {};
    if (category && category !== "all") {
      query.category = category; 
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { description: { $regex: search as string, $options: "i" } },
      ];
    }

    const permissions = await Permission.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
