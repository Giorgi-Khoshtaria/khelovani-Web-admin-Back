import type { Request, Response } from "express";
import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { isMalicious } from "../../../utils/security/isMalicious.js";

// @desc    Create a new permission
// @route   POST /api/admin/permissions
export const createPermission = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ message: "Body is required" });
      return;
    }

    const { name, description, category } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    // 1. Basic Name Validation
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.length > 100) {
      res.status(400).json({ message: tValidation("name_description_required") });
      return;
    }

    // 1b. Description Length check
    if (description && typeof description === "string" && description.length > 1000) {
      res.status(400).json({ message: "Description too long" });
      return;
    }

    // 2. Malicious Content Check
    if (isMalicious(name) || (description && isMalicious(description))) {
      res.status(400).json({ message: "Malicious content detected" });
      return;
    }

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
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
