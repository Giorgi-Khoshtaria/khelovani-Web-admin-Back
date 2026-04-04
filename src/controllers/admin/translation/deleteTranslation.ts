import { Request, Response } from "express";
import Translation from "../../../modules/translation.modules.js";
import { loadTranslationCache, useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Delete a translation
// @route   DELETE /api/admin/translations/:id
// @access  Private Admin
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
