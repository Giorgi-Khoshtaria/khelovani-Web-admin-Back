import type { Request, Response } from "express";
import Role from "../../../modules/role.modules.js";
import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

// @desc    Create a new role
// @route   POST /api/admin/roles
// @access  Private Admin
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const { name, allowedPanels, permissions, description, isActive } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  const safeDesc = description || "";
  const uniquePerms = [...new Set(permissions as string[])] as any[];

  const existingPermsCount = await Permission.countDocuments({
    _id: { $in: uniquePerms },
  });
  if (existingPermsCount !== uniquePerms.length) {
    throw new AppError("One or more permissions do not exist", 422);
  }

  const existingRole = await Role.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
  });
  if (existingRole) {
    throw new AppError(
      tAlerts("role_already_exists") || "Role already exists",
      409,
    );
  }

  const newRole = await Role.create({
    name,
    allowedPanels,
    permissions: uniquePerms,
    description: safeDesc,
    isActive: isActive !== undefined ? isActive : true,
  });

  sendResponse(
    res,
    201,
    tAlerts("role_created_success") || "Role created successfully",
    newRole,
  );
});
