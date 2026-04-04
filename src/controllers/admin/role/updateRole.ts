import type { Request, Response } from "express";
import mongoose from "mongoose";
import Role from "../../../modules/role.modules.js";
import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { isMalicious } from "../../../utils/security/isMalicious.js";
import { areValidObjectIds, SYSTEM_ROLES } from "./role.utils.js";

// @desc    Update an existing role
// @route   PUT /api/admin/roles/:id
// @access  Private Admin
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, allowedPanels, permissions, description, isActive } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({ message: "Invalid role ID format" });
      return;
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ message: "Request body cannot be empty" });
      return;
    }

    const role = await Role.findById(id as string);
    if (!role) {
      res.status(404).json({ message: tAlerts("role_not_found") });
      return;
    }

    // 1. System Role Protection
    const isSystemRole = SYSTEM_ROLES.includes(role.name);
    if (isSystemRole) {
      if (name && name !== role.name) {
        res.status(400).json({ message: tAlerts("admin_rename_forbidden") });
        return;
      }
      if (allowedPanels && (allowedPanels.length === 0)) {
        res.status(400).json({ message: "System roles must have at least one panel" });
        return;
      }
    }

    // 2. Validation & Security
    if (name) {
      if (name.length < 2 || name.length > 100) {
        res.status(400).json({ message: "Name must be 2-100 characters" });
        return;
      }
      if (isMalicious(name)) {
        res.status(400).json({ message: "Malicious name detected" });
        return;
      }
      const duplicate = await Role.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id }
      });
      if (duplicate) {
        res.status(409).json({ message: "Role name already in use" });
        return;
      }
      role.name = name;
    }

    if (description !== undefined) {
      if (description.length > 500) {
        res.status(400).json({ message: "Description too long" });
        return;
      }
      if (isMalicious(description)) {
        res.status(400).json({ message: "Malicious description detected" });
        return;
      }
      role.description = description;
    }

    if (allowedPanels) {
      const validPanels = ["web", "admin", "admin-organization"];
      if (!Array.isArray(allowedPanels)) {
        res.status(400).json({ message: "allowedPanels must be an array" });
        return;
      }
      if (allowedPanels.some(p => !validPanels.includes(p))) {
        res.status(400).json({ message: "Invalid panel detected" });
        return;
      }
      role.allowedPanels = allowedPanels;
    }

    if (permissions) {
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
      role.permissions = uniquePerms;
    }

    if (isActive !== undefined) role.isActive = isActive;

    const updatedRole = await role.save();
    res.status(200).json({
      message: tAlerts("role_updated_success"),
      role: updatedRole,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
