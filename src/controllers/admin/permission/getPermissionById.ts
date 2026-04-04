import type { Request, Response } from "express";
import mongoose from "mongoose";
import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Get single permission by ID
// @route   GET /api/admin/permissions/:id
export const getPermissionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: tAlerts("invalid_id") || "Invalid ID format" });
      return;
    }

    const permission = await Permission.findById(id);
    if (!permission) {
      res.status(404).json({ message: tAlerts("permission_not_found") });
      return;
    }

    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
