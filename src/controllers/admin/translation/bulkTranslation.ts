import { Request, Response } from "express";
import Translation, { Namespace } from "../../../modules/translation.modules.js";
import { loadTranslationCache, useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Bulk import/update translations
// @route   POST /api/admin/translations/bulk
// @access  Private Admin
export const bulkTranslation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { items } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

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

    // 1. Verify all namespaces exist before proceeding
    const existingNamespaces = await Namespace.find().lean();
    const existingIds = existingNamespaces.map((ns: any) => ns._id.toString());

    const invalidItems = items.filter((item: any) => !existingIds.includes(item.namespace));
    
    if (invalidItems.length > 0) {
      const uniqueInvalids = [...new Set(invalidItems.map((i: any) => i.namespace))];
      res.status(422).json({ 
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
