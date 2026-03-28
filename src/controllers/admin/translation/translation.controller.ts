import { Request, Response } from "express";
import Translation, { Namespace } from "../../../modules/translation.modules.js";
import { validateTranslation } from "../../../validations/forms/translationValidation.js";
import { loadTranslationCache, useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// GET /api/admin/translations
// Returns translations grouped by namespace and raw list
export const getTranslations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { namespace, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limitQuery = req.query.limit as string;
    const limit = limitQuery !== undefined ? parseInt(limitQuery) : 15;
    const skip = (page - 1) * (limit > 0 ? limit : 0);
    
    let filter: any = {};
    if (namespace) filter.namespace = namespace;
    if (search) {
      filter.$or = [
        { key: { $regex: search as string, $options: "i" } },
        { "translations.ge": { $regex: search as string, $options: "i" } },
        { "translations.en": { $regex: search as string, $options: "i" } },
      ];
    }

    const [translations, totalCount] = await Promise.all([
      Translation.find(filter)
        .skip(skip)
        .limit(limit > 0 ? limit : 0) // MongoDB: limit(0) returns all
        .lean(),
      Translation.countDocuments(filter),
    ]);
    
    // Group by namespace for easy consumption
    const grouped: Record<string, Record<string, { ge: string; en: string }>> = {};
    
    translations.forEach((item: any) => {
      const ns = item.namespace;
      if (!grouped[ns]) {
        grouped[ns] = {};
      }
      grouped[ns][item.key] = item.translations;
    });

    res.status(200).json({
      success: true,
      data: {
        grouped,
        raw: translations,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res.status(500).json({ success: false, message: tAlerts("server_error") || (error as Error).message });
  }
};

// GET /api/admin/namespaces
export const getNamespaces = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const namespaces = await Namespace.find().lean();
    res.status(200).json({ success: true, data: namespaces });
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res.status(500).json({ success: false, message: tAlerts("server_error") || (error as Error).message });
  }
};

// POST /api/admin/translations
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

// PUT /api/admin/translations/:id
export const updateTranslation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { translations } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!translations || (!translations.ge && !translations.en)) {
      res.status(400).json({
        success: false,
        errors: [{
          field: "ge",
          message: tValidation("at_least_one_translation_required"),
        }],
      });
      return;
    }

    const translation = await Translation.findById(id);
    if (!translation) {
      res.status(404).json({
        success: false,
        message: tAlerts("translation_not_found"),
      });
      return;
    }

    if (!translation.translations) {
      translation.translations = { ge: "", en: "" };
    }

    if (translations.ge) translation.translations.ge = translations.ge;
    if (translations.en) translation.translations.en = translations.en;

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
    res.status(500).json({ success: false, message: tAlerts("server_error") || (error as Error).message });
  }
};

// DELETE /api/admin/translations/:id
export const deleteTranslation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const translation = await Translation.findByIdAndDelete(id);
    if (!translation) {
      res.status(404).json({
        success: false,
        message: tAlerts("translation_not_found"),
      });
      return;
    }

    loadTranslationCache();

    res.status(200).json({
      success: true,
      message: tAlerts("translation_deleted_success"),
    });
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res.status(500).json({ success: false, message: tAlerts("server_error") || (error as Error).message });
  }
};


