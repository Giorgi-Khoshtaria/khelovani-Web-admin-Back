import type { Request, Response } from "express";
import mongoose from "mongoose";
import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { isMalicious } from "../../../utils/security/isMalicious.js";

// @desc    Update a permission
// @route   PUT /api/admin/permissions/:id
export const updatePermission = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ message: "Empty body not allowed" });
      return;
    }

    const { name, description, category } = req.body;

    const permission = await Permission.findById(id);
    if (!permission) {
      res.status(404).json({ message: tAlerts("permission_not_found") });
      return;
    }

    // Description length check
    if (description && description.length > 1000) {
      res.status(400).json({ message: "Description too long" });
      return;
    }

    // Malicious check for update
    if (description && isMalicious(description)) {
      res.status(400).json({ message: "Malicious content detected" });
      return;
    }

    if (description !== undefined) permission.description = description;
    if (category) permission.category = category;

    const updated = await permission.save();

    res.status(200).json({
      message: tAlerts("permission_updated_success"),
      permission: updated,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
