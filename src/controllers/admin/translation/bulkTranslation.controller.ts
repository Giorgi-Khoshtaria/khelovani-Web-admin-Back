import { Request, Response } from "express";
import Translation, { Namespace } from "../../../modules/translation.modules.js";
import { loadTranslationCache, useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

export const bulkTranslation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { items } = req.body; // Array of { namespace, key, ge, en }
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!items || !Array.isArray(items)) {
      res.status(400).json({
        success: false,
        message: tAlerts("invalid_payload_items_array"),
      });
      return;
    }

    const bulkOps = items.map((item: any) => ({
      updateOne: {
        filter: { namespace: item.namespace, key: item.key },
        update: {
          $set: {
            translations: { 
              ge: item.ge || "", 
              en: item.en || "" 
            },
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length === 0) {
      res.status(400).json({
        success: false,
        message: tAlerts("no_items_to_import"),
      });
      return;
    }

    // 1. Verify all namespaces exist before proceeding
    const existingNamespaces = await Namespace.find().lean();
    const existingIds = existingNamespaces.map((ns: any) => ns._id);

    const invalidItems = items.filter((item: any) => !existingIds.includes(item.namespace));
    
    if (invalidItems.length > 0) {
      const uniqueInvalids = [...new Set(invalidItems.map((i: any) => i.namespace))];
      res.status(400).json({ 
        success: false, 
        message: `${tAlerts("import_failed_namespaces_not_found")}: ${uniqueInvalids.join(", ")}` 
      });
      return;
    }

    // 2. Insert/Update translations
    await Translation.bulkWrite(bulkOps);

    loadTranslationCache();

    res.status(200).json({
      success: true,
      message: tAlerts("translations_bulk_import_success"),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const bulkDeleteTranslations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { ids } = req.body; // Array of string IDs
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({
        success: false,
        message: tAlerts("invalid_payload_items_array"),
      });
      return;
    }

    if (ids.length === 0) {
      res.status(400).json({
        success: false,
        message: tAlerts("no_items_to_delete"),
      });
      return;
    }

    await Translation.deleteMany({ _id: { $in: ids } });

    loadTranslationCache();

    res.status(200).json({
      success: true,
      message: tAlerts("translations_bulk_delete_success"),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


