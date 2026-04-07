import type { Request, Response } from "express";
import mongoose from "mongoose";
import Role from "../../../modules/role.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Get role by ID
// @route   GET /api/admin/roles/:id
// @access  Private Admin
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(422).json({ message: "Invalid role ID format" });
      return;
    }

    const role = await Role.findById(id as string).populate("permissions");
    if (!role) {
      res.status(404).json({ message: tAlerts("role_not_found") });
      return;
    }

    res.status(200).json(role);
  } catch (error: any) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(422).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};
