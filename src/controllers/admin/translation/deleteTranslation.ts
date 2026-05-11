import mongoose from "mongoose";
import Translation from "../../../modules/translation.modules.js";
import {
  loadTranslationCache,
  useTranslation,
} from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { invalidateTranslations } from "../../../utils/cache/invalidators.js";

/**
 * @desc    Delete a translation
 * @route   DELETE /api/admin/translations/:id
 * @access  Private Admin
 */
export const deleteTranslation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_translation_id") || "Invalid translation ID", 422);
  }

  const translation = await Translation.findByIdAndDelete(id);
  if (!translation) {
    throw new AppError(tAlerts("translation_not_found"), 404);
  }

  loadTranslationCache();
  void invalidateTranslations();

  sendResponse(
    res,
    200,
    tAlerts("translation_deleted_success") || "Translation deleted successfully",
  );
});
