import type { Request, Response } from "express";
import Role from "../../../modules/role.modules.js";
import Permission from "../../../modules/permission.modules.js";
import { PANELS } from "../../../middleware/role/permissions.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { areValidObjectIds } from "./role.utils.js";

// @desc    Create a new role
// @route   POST /api/admin/roles
// @access  Private Admin
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, allowedPanels, permissions, description, isActive } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const safeDesc = description || "";
    const uniquePerms = [...new Set(permissions as string[])] as any[];
    
    // Database integrity checks remain (though Zod validates the ID format)
    const existingPermsCount = await Permission.countDocuments({ _id: { $in: uniquePerms } });
    if (existingPermsCount !== uniquePerms.length) {
      res.status(422).json({ message: "One or more permissions do not exist" });
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
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(422).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};
