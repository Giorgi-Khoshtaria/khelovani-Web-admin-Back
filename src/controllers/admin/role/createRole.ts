import type { Request, Response } from "express";
import Role from "../../../modules/role.modules.js";
import Permission from "../../../modules/permission.modules.js";
import { PANELS } from "../../../middleware/role/permissions.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { isMalicious } from "../../../utils/security/isMalicious.js";
import { areValidObjectIds } from "./role.utils.js";

// @desc    Create a new role
// @route   POST /api/admin/roles
// @access  Private Admin
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      allowedPanels = [PANELS.ADMIN],
      permissions = [],
      description,
      isActive = true,
    } = req.body;

    const lang = (req.query.lang as Lang) || "ge";
    const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    // 1. Basic validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ 
        message: tValidation("name_required") || "Name must be at least 2 characters" 
      });
      return;
    }

    // Description is now optional
    const safeDesc = description ? String(description) : "";

    // 2. Length constraints
    if (name.length > 100) {
      res.status(400).json({ message: "Name too long (max 100)" });
      return;
    }
    if (safeDesc.length > 500) {
      res.status(400).json({ message: "Description too long (max 500)" });
      return;
    }

    // 3. Security guards
    if (isMalicious(name) || isMalicious(safeDesc)) {
      res.status(400).json({ message: "Potentially malicious input detected" });
      return;
    }

    // 4. Panel validation
    const validPanels = ["web", "admin", "admin-organization"];
    if (!Array.isArray(allowedPanels)) {
      res.status(400).json({ message: "allowedPanels must be an array" });
      return;
    }
    if (allowedPanels.some(p => !validPanels.includes(p))) {
      res.status(400).json({ message: "Invalid panel detected" });
      return;
    }

    // 5. Permission validation & deduplication
    if (!areValidObjectIds(permissions)) {
      res.status(400).json({ message: "Invalid permission ID format" });
      return;
    }

    const uniquePerms = [...new Set(permissions as string[])] as any[];
    const existingPermsCount = await Permission.countDocuments({ _id: { $in: uniquePerms } });
    if (existingPermsCount !== uniquePerms.length) {
      res.status(400).json({ message: "One or more permissions do not exist" });
      return;
    }

    // 6. Duplicate check
    const existingRole = await Role.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingRole) {
      res.status(409).json({ message: tAlerts("role_already_exists") });
      return;
    }

    const newRole = await Role.create({
      name,
      allowedPanels,
      permissions: uniquePerms,
      description: safeDesc,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      message: tAlerts("role_created_success"),
      role: newRole,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};
