import mongoose from "mongoose";
import Role from "../../../modules/role.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Get role by ID
 * @route   GET /api/admin/roles/:id
 * @access  Private Admin
 */
export const getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError("Invalid role ID format", 422);
  }

  const role = await Role.findById(id).populate("permissions");
  if (!role) {
    throw new AppError(tAlerts("role_not_found"), 404);
  }

  sendResponse(res, 200, "Role retrieved successfully", role);
});
