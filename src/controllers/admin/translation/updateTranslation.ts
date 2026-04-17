import mongoose from "mongoose";
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

/**
 * @desc    Update a translation
 * @route   PUT /api/admin/translations/:id
 * @access  Private Admin
 */
export const updateTranslation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { translations, namespace, key } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_translation_id") || "Invalid translation ID", 422);
  }

  const translation = await Translation.findById(id);
  if (!translation) {
    throw new AppError(tAlerts("translation_not_found"), 404);
  }

  const newNamespace = namespace || translation.namespace;
  const newKey = key || translation.key;

  // Validate namespace exists before using it in any other query
  if (namespace) {
    const nsExists = await Namespace.findById(namespace);
    if (!nsExists) {
      throw new AppError(tAlerts("namespace_not_found"), 404);
    }
  }

  // Check key+namespace uniqueness
  if (
    newNamespace.toString() !== translation.namespace.toString() ||
    newKey !== translation.key
  ) {
    const existing = await Translation.findOne({
      namespace: newNamespace,
      key: newKey,
      _id: { $ne: id },
    });

    if (existing) {
      throw new AppError(tAlerts("translation_key_exists"), 422);
    }
  }

  if (namespace) {
    translation.namespace = namespace;
  }

  if (key) {
    translation.key = key;
  }

  if (translations) {
    if (!translation.translations) {
      translation.translations = { ge: "", en: "" };
    }
    if (translations.ge !== undefined)
      translation.translations.ge = translations.ge;
    if (translations.en !== undefined)
      translation.translations.en = translations.en;
  }

  await translation.save();

  loadTranslationCache();

  sendResponse(
    res,
    200,
    tAlerts("translation_updated_success") || "Translation updated successfully",
    translation,
  );
});
