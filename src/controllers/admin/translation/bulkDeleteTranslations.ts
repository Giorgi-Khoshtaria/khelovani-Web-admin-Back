import { Request, Response } from "express";
import Translation from "../../../modules/translation.modules.js";
import { loadTranslationCache, useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Bulk delete translations
// @route   DELETE /api/admin/translations/bulk
// @access  Private Admin
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
