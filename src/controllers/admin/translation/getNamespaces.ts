import { Request, Response } from "express";
import { Namespace } from "../../../modules/translation.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Get all namespaces
// @route   GET /api/admin/namespaces
// @access  Private Admin
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
