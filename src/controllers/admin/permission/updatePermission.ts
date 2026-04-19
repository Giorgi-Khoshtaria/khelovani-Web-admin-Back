import type { Request, Response } from "express";
import mongoose from "mongoose";
import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

// @desc    Update a permission
// @route   PUT /api/admin/permissions/:id
export const updatePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, category } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      throw new AppError("Invalid ID format", 422);
    }

    const permission = await Permission.findById(id);
    if (!permission) {
      throw new AppError(
        tAlerts("permission_not_found") || "Permission not found",
        404,
      );
    }

    // 2. Business Logic Updates (Zod handled format/security)

    if (name) {
      if (name !== permission.name) {
        const duplicate = await Permission.findOne({ name, _id: { $ne: id } });
        if (duplicate) {
          throw new AppError("Permission name already exists", 409);
        }
        permission.name = name;
      }
    }

    if (description !== undefined) permission.description = description;
    if (category) permission.category = category;

    const updated = await permission.save();

    sendResponse(res, 200, tAlerts("permission_updated_success") || "Permission updated successfully", updated);
  },
);
