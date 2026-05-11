import Translation, {
  Namespace,
} from "../../../modules/translation.modules.js";
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
 * @desc    Add a single translation
 * @route   POST /api/admin/translations
 * @access  Private Admin
 */
export const addTranslation = asyncHandler(async (req, res) => {
  const { namespace, key, translations } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  // 1. Verify namespace exists
  const nsExists = await Namespace.findById(namespace);
  if (!nsExists) {
    throw new AppError(tAlerts("namespace_not_found"), 404);
  }

  // 2. Check for duplicate key in this namespace
  const existing = await Translation.findOne({ namespace, key });
  if (existing) {
    throw new AppError(tAlerts("translation_key_exists"), 422);
  }

  // 3. Create translation
  const translation = await Translation.create({
    namespace,
    key,
    translations,
  });

  loadTranslationCache();
  void invalidateTranslations();

  sendResponse(
    res,
    201,
    tAlerts("translation_added_success") || "Translation added successfully",
    translation,
  );
});
