import Translation from "../../../modules/translation.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";

/**
 * @desc    Get all translations (grouped or raw)
 * @route   GET /api/admin/translations
 * @access  Private Admin
 */
export const getTranslations = asyncHandler(async (req, res) => {
  const { namespace } = req.query;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const parsedLimit = parseInt(req.query.limit as string);
  // limit=0 means "fetch all" (MongoDB .limit(0) = no limit)
  const fetchAll = req.query.limit !== undefined && parsedLimit === 0;
  const limit = fetchAll ? 0 : Math.max(1, isNaN(parsedLimit) ? 15 : parsedLimit);
  const skip = fetchAll ? 0 : (page - 1) * limit;

  const filter: any = {};
  if (namespace) filter.namespace = namespace;

  if (req.query.search) {
    const escaped = escapeRegex(req.query.search as string);
    filter.$or = [
      { key: { $regex: escaped, $options: "i" } },
      { "translations.ge": { $regex: escaped, $options: "i" } },
      { "translations.en": { $regex: escaped, $options: "i" } },
    ];
  }

  const query = Translation.find(filter).skip(skip);
  if (!fetchAll) query.limit(limit);

  const [translations, totalCount] = await Promise.all([
    query.lean(),
    Translation.countDocuments(filter),
  ]);

  const grouped: Record<string, Record<string, { ge: string; en: string }>> = {};
  translations.forEach((item: any) => {
    const ns = item.namespace;
    if (!grouped[ns]) grouped[ns] = {};
    grouped[ns][item.key] = item.translations;
  });

  const effectiveLimit = fetchAll ? totalCount : limit;

  sendResponse(res, 200, "Translations retrieved successfully", { grouped, raw: translations }, {
    totalCount,
    totalPages: effectiveLimit > 0 ? Math.ceil(totalCount / effectiveLimit) : 1,
    currentPage: fetchAll ? 1 : page,
  });
});
