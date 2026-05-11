import Translation from "../../../modules/translation.modules.js";
import { loadTranslationCache, useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { invalidateTranslations } from "../../../utils/cache/invalidators.js";

/**
 * @desc    Bulk delete translations
 * @route   POST /api/admin/translations/bulk-delete
 * @access  Private Admin
 */
export const bulkDeleteTranslations = asyncHandler(async (req, res) => {
  const { ids } = req.body; // Array of string IDs
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!ids || !Array.isArray(ids)) {
    throw new AppError(tAlerts("invalid_payload_items_array") || "Invalid items array", 400);
  }

  if (ids.length === 0) {
    throw new AppError(tAlerts("no_items_to_delete") || "No items to delete", 400);
  }

  await Translation.deleteMany({ _id: { $in: ids } });

  loadTranslationCache();
  void invalidateTranslations();

  sendResponse(res, 200, tAlerts("translations_bulk_delete_success") || "Translations deleted successfully");
});
