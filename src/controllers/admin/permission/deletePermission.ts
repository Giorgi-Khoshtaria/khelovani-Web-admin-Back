import mongoose from "mongoose";
import Permission from "../../../modules/permission.modules.js";
import Role from "../../../modules/role.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Delete a permission
 * @route   DELETE /api/admin/permissions/:id
 * @access  Private Admin
 */
export const deletePermission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError("Invalid ID", 422);
  }

  const permission = await Permission.findById(id);
  if (!permission) {
    throw new AppError(tAlerts("permission_not_found"), 404);
  }

  // CASCADE: Remove this permission from all roles that use it
  await Role.updateMany({ permissions: id }, { $pull: { permissions: id } });

  await Permission.findByIdAndDelete(id);

  sendResponse(
    res,
    200,
    tAlerts("permission_deleted_success") || "Permission deleted successfully",
    {
      _id: id,
    },
  );
});
