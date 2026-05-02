import Permission from "../../../modules/permission.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { toTitleCase } from "../../../utils/string.utils.js";

/**
 * @desc    Create a new permission
 * @route   POST /api/admin/permissions
 * @access  Private Admin
 */
export const createPermission = asyncHandler(async (req, res) => {
  const { name, description, category } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  // Business Logical Check: Duplicate name
  const existing = await Permission.findOne({ name });
  if (existing) {
    throw new AppError(
      tAlerts("permission_already_exists") || "Permission already exists",
      409,
    );
  }

  const newPermission = await Permission.create({
    name,
    description: description || "",
    category: category ? toTitleCase(category) : "General",
  });

  sendResponse(
    res,
    201,
    tAlerts("permission_created_success") || "Permission created successfully",
    newPermission,
  );
});
