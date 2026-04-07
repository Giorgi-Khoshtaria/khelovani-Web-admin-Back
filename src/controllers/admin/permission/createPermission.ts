import type { Request, Response } from "express";
import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Create a new permission
// @route   POST /api/admin/permissions
export const createPermission = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, category } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    // Business Logical Check: Duplicate name

    const existing = await Permission.findOne({ name });
    if (existing) {
      res.status(409).json({ message: tAlerts("permission_already_exists") });
      return;
    }

    const newPermission = await Permission.create({
      name,
      description: description || "",
      category: category || "General",
    });

    res.status(201).json({
      message: tAlerts("permission_created_success"),
      permission: newPermission,
    });
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(422).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};
