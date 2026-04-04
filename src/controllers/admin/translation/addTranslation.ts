import { Request, Response } from "express";
import Translation, { Namespace } from "../../../modules/translation.modules.js";
import { validateTranslation } from "../../../validations/forms/translationValidation.js";
import { loadTranslationCache, useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Add a single translation
// @route   POST /api/admin/translations
// @access  Private Admin
export const addTranslation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { namespace, key, translations } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const validationErrors = validateTranslation({ namespace, key, translations }, lang);
    if (validationErrors.length > 0) {
      res.status(400).json({ success: false, errors: validationErrors });
      return;
    }

    // Verify namespace exists
    const nsExists = await Namespace.findById(namespace);
    if (!nsExists) {
      res.status(404).json({
        success: false,
        message: tAlerts("namespace_not_found"),
      });
      return;
    }

    // Check if key already exists in this namespace
    const existing = await Translation.findOne({ namespace, key });
    if (existing) {
      res.status(400).json({
        success: false,
        message: tAlerts("translation_key_exists"),
      });
      return;
    }

    const newTranslation = await Translation.create({
      namespace,
      key,
      translations,
    });

    loadTranslationCache();

    res.status(201).json({ success: true, data: newTranslation });
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res.status(500).json({ success: false, message: tAlerts("server_error") || (error as Error).message });
  }
};
