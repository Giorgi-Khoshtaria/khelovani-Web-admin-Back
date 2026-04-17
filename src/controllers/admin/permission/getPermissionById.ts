import mongoose from "mongoose";
import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Get single permission by ID
 * @route   GET /api/admin/permissions/:id
 * @access  Private Admin
 */
export const getPermissionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_id") || "Invalid ID format", 422);
  }

  const permission = await Permission.findById(id);
  if (!permission) {
    throw new AppError(tAlerts("permission_not_found"), 404);
  }

  sendResponse(res, 200, "Permission retrieved successfully", permission);
});
