import type { Request, Response } from "express";
import mongoose from "mongoose";
import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Update a permission
// @route   PUT /api/admin/permissions/:id
export const updatePermission = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, category } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(422).json({ message: "Invalid ID format" });
      return;
    }

    const permission = await Permission.findById(id);
    if (!permission) {
      res.status(404).json({ message: tAlerts("permission_not_found") });
      return;
    }

    // 2. Business Logic Updates (Zod handled format/security)

    if (description !== undefined) permission.description = description;
    if (category) permission.category = category;

    const updated = await permission.save();

    res.status(200).json({
      message: tAlerts("permission_updated_success"),
      permission: updated,
    });
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(422).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};
