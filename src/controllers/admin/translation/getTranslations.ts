import { Request, Response } from "express";
import Translation from "../../../modules/translation.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

// @desc    Get all translations (grouped or raw)
// @route   GET /api/admin/translations
// @access  Private Admin
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
        .limit(limit > 0 ? limit : 0)
        .lean(),
      Translation.countDocuments(filter),
    ]);
    
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
