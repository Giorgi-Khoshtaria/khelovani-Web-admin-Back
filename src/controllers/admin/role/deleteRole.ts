import type { Request, Response } from "express";
import mongoose from "mongoose";
import Role from "../../../modules/role.modules.js";
import Admin from "../../../modules/admin.modules.js";
import Organisation from "../../../modules/organization.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { SYSTEM_ROLES } from "./role.utils.js";

// @desc    Delete a role
// @route   DELETE /api/admin/roles/:id
// @access  Private Admin
export const deleteRole = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(422).json({ message: "Invalid ID format" });
      return;
    }

    const role = await Role.findById(id as string);
    if (!role) {
      res.status(404).json({ message: tAlerts("role_not_found") });
      return;
    }

    // 1. System Role Protection
    if (SYSTEM_ROLES.includes(role.name)) {
      res.status(422).json({ message: tAlerts("admin_delete_forbidden") });
      return;
    }

    // 2. Referential Integrity Check
    // Check Admins
    const inAdmin = await Admin.exists({ role: id as string });
    if (inAdmin) {
      res
        .status(409)
        .json({ message: "Cannot delete role assigned to an admin" });
      return;
    }

    // Check Organisations
    const inOrg = await Organisation.exists({ role: id as string });
    if (inOrg) {
      res
        .status(409)
        .json({ message: "Cannot delete role assigned to an organization" });
      return;
    }

    await Role.findByIdAndDelete(id as string);

    res.status(200).json({
      message: tAlerts("role_deleted_success"),
      _id: id,
    });
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(422).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};
