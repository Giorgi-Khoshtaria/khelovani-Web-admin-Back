import type { Request, Response } from "express";
import mongoose from "mongoose";
import Role from "../../../modules/role.modules.js";
import Admin from "../../../modules/admin.modules.js";
import Organisation from "../../../modules/organization.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { SYSTEM_ROLES } from "../../../utils/role.utils.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

// @desc    Delete a role
// @route   DELETE /api/admin/roles/:id
// @access  Private Admin
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError("Invalid ID format", 422);
  }

  const role = await Role.findById(id as string);
  if (!role) {
    throw new AppError(tAlerts("role_not_found") || "Role not found", 404);
  }

  // 1. System Role Protection
  if (SYSTEM_ROLES.includes(role.name)) {
    throw new AppError(
      tAlerts("admin_delete_forbidden") || "Cannot delete system roles",
      422,
    );
  }

  // 2. Referential Integrity Check
  // Check Admins
  const inAdmin = await Admin.exists({ role: id as string });
  if (inAdmin) {
    throw new AppError("Cannot delete role assigned to an admin", 409);
  }

  // Check Organisations
  const inOrg = await Organisation.exists({ role: id as string });
  if (inOrg) {
    throw new AppError("Cannot delete role assigned to an organization", 409);
  }

  await Role.findByIdAndDelete(id as string);

  sendResponse(
    res,
    200,
    tAlerts("role_deleted_success") || "Role deleted successfully",
    { _id: id },
  );
});
