import { Request, Response } from "express";
import Translation, { Namespace } from "../../../modules/translation.modules.js";
import {
  loadTranslationCache,
  useTranslation,
} from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Update a translation
// @route   PUT /api/admin/translations/:id
// @access  Private Admin
export const updateTranslation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { translations, namespace, key } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const translation = await Translation.findById(id);
    if (!translation) {
      res.status(404).json({
        success: false,
        message: tAlerts("translation_not_found"),
      });
      return;
    }

    const newNamespace = namespace || translation.namespace;
    const newKey = key || translation.key;

    // If key or namespace is changing, check for uniqueness
    if (newNamespace !== translation.namespace || newKey !== translation.key) {
      const existing = await Translation.findOne({
        namespace: newNamespace,
        key: newKey,
        _id: { $ne: id },
      });

      if (existing) {
        res.status(422).json({
          success: false,
          message: tAlerts("translation_key_exists"),
        });
        return;
      }
    }

    if (namespace) {
      // Verify namespace exists
      const nsExists = await Namespace.findById(namespace);
      if (!nsExists) {
        res.status(404).json({
          success: false,
          message: tAlerts("namespace_not_found"),
        });
        return;
      }
      translation.namespace = namespace;
    }

    if (key) {
      translation.key = key;
    }

    if (!translation.translations) {
      translation.translations = { ge: "", en: "" };
    }

    if (translations) {
      if (translations.ge) translation.translations.ge = translations.ge;
      if (translations.en) translation.translations.en = translations.en;
    }

    await translation.save();

    loadTranslationCache();

    res.status(200).json({
      success: true,
      message: tAlerts("translation_updated_success"),
      data: translation,
    });
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res
      .status(500)
      .json({
        success: false,
        message: tAlerts("server_error") || (error as Error).message,
      });
  }
};
