import type { Request, Response } from "express";
import mongoose from "mongoose";
import Role from "../../../modules/role.modules.js";
import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { SYSTEM_ROLES } from "../../../utils/role.utils.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

// @desc    Update an existing role
// @route   PUT /api/admin/roles/:id
// @access  Private Admin
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, allowedPanels, permissions, description, isActive } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_role_id") || "Invalid role ID", 422);
  }

  const role = await Role.findById(id);
  if (!role) {
    throw new AppError(tAlerts("role_not_found") || "Role not found", 404);
  }

  const isSystemRole = SYSTEM_ROLES.includes(role.name);
  if (isSystemRole) {
    if (name && name !== role.name) {
      throw new AppError(
        tAlerts("admin_rename_forbidden") || "Cannot rename system roles",
        422,
      );
    }
    if (allowedPanels && allowedPanels.length === 0) {
      throw new AppError("System roles must have at least one panel", 422);
    }
  }

  if (name) {
    const duplicate = await Role.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
      _id: { $ne: id },
    });
    if (duplicate) {
      throw new AppError("Role name already in use", 409);
    }
    role.name = name;
  }

  if (description !== undefined) {
    role.description = description;
  }

  if (allowedPanels) {
    role.allowedPanels = allowedPanels;
  }

  if (permissions) {
    const uniquePerms = [...new Set(permissions as string[])] as any[];
    const existingPermsCount = await Permission.countDocuments({
      _id: { $in: uniquePerms },
    });
    if (existingPermsCount !== uniquePerms.length) {
      throw new AppError("One or more permissions do not exist", 422);
    }
    role.permissions = uniquePerms;
  }

  if (isActive !== undefined) role.isActive = isActive;

  const updatedRole = await role.save();
  sendResponse(
    res,
    200,
    tAlerts("role_updated_success") || "Role updated successfully",
    updatedRole,
  );
});
