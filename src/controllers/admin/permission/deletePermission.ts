import type { Request, Response } from "express";
import mongoose from "mongoose";
import Permission from "../../../modules/permission.modules.js";
import Role from "../../../modules/role.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Delete a permission
// @route   DELETE /api/admin/permissions/:id
export const deletePermission = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(422).json({ message: "Invalid ID" });
      return;
    }

    const permission = await Permission.findById(id);
    if (!permission) {
      res.status(404).json({ message: tAlerts("permission_not_found") });
      return;
    }

    // CASCADE: Remove this permission from all roles that use it
    await Role.updateMany(
      { permissions: id },
      { $pull: { permissions: id } }
    );

    await Permission.findByIdAndDelete(id);

    res.status(200).json({
      message: tAlerts("permission_deleted_success"),
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
