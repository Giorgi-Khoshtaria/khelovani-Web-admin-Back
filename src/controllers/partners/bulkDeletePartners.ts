import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

// @desc    Bulk delete partners
// @route   POST /api/admin/partners/bulk-delete
// @access  Private Admin
export const bulkDeletePartners = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { ids } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    await Organisation.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message: tAlerts("translations_bulk_delete_success"), // Reusing generic bulk delete success message
    });
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res.status(500).json({ message: tAlerts("server_error") || (error as Error).message });
  }
};
