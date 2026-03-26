import type { Request, Response } from "express";
import Role from "../../../modules/role.modules.js";
import { ROLES } from "../../../middleware/role/permissions.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Get all roles
// @route   GET /api/admin/roles
// @access  Private Admin
export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.find().populate("permissions");
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Get role by ID
// @route   GET /api/admin/roles/:id
// @access  Private Admin
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    const role = await Role.findById(id).populate("permissions");
    if (!role) {
      res.status(404).json({
        message: tAlerts("role_not_found"),
      });
      return;
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Available permissions are now managed via Permission Controller

// @desc    Create a new role
// @route   POST /api/admin/roles
// @access  Private Admin
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, allowedPanels, permissions, description, isActive } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!name || !description) {
      res.status(400).json({
        message: tValidation("name_description_required"),
      });
      return;
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      res.status(400).json({
        message: tAlerts("role_already_exists"),
      });
      return;
    }

    const newRole = await Role.create({
      name,
      allowedPanels: allowedPanels || [],
      permissions: permissions || [],
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      message: tAlerts("role_created_success"),
      role: newRole,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update an existing role
// @route   PUT /api/admin/roles/:id
// @access  Private Admin
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, allowedPanels, permissions, description, isActive } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const role = await Role.findById(id);
    if (!role) {
      res.status(404).json({
        message: tAlerts("role_not_found"),
      });
      return;
    }

    // Optional: Prevent renaming system critical roles if any
    if (role.name === ROLES.ADMIN && name && name !== ROLES.ADMIN) {
      res.status(400).json({
        message: tAlerts("admin_rename_forbidden"),
      });
      return;
    }

    if (name) role.name = name;
    if (description) role.description = description;
    if (allowedPanels) role.allowedPanels = allowedPanels;
    if (permissions) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;

    const updatedRole = await role.save();

    res.status(200).json({
      message: tAlerts("role_updated_success"),
      role: updatedRole,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete a role
// @route   DELETE /api/admin/roles/:id
// @access  Private Admin
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const role = await Role.findById(id);
    if (!role) {
      res.status(404).json({
        message: tAlerts("role_not_found"),
      });
      return;
    }

    // Prevent deleting admin or items that are locked
    if (role.name === ROLES.ADMIN) {
      res.status(400).json({
        message: tAlerts("admin_delete_forbidden"),
      });
      return;
    }

    await Role.findByIdAndDelete(id);

    res.status(200).json({
      message: tAlerts("role_deleted_success"),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};


