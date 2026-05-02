import Organisation from "../../modules/organization.modules.js";
import { PartnerTypeEnum } from "../../types/partnerTypes.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

const MAX_LIMIT = 100;

/**
 * @desc    Get public partners
 * @route   GET /api/partner/public
 * @access  Public
 */
export const getPublicPartners = asyncHandler(async (req, res) => {
  const { search, page = "1", limit = "12", city, category, minRating, partnerType } = req.query;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  const query: any = {
    status: PartnerStatusEnum.APPROVED,
    isShown: true,
  };

  if (search) {
    const escaped = escapeRegex(String(search));
    query.$or = [
      { companyNameGe: { $regex: escaped, $options: "i" } },
      { companyNameEn: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  if (city) {
    query.city = city;
  }

  if (category) {
    const cats = Array.isArray(category) ? category : [category];
    query.categories = { $in: cats };
  }

  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }

  if (partnerType === PartnerTypeEnum.ORGANIZATION || partnerType === PartnerTypeEnum.INDIVIDUAL) {
    query.partnerType = partnerType;
  }

  const rawPage = parseInt(page as string, 10);
  const rawLimit = parseInt(limit as string, 10);

  if (!isNaN(rawPage) && rawPage < 1) {
    throw new AppError(tAlerts("invalid_pagination") || "Invalid page or limit", 422);
  }
  if (!isNaN(rawLimit) && rawLimit < 1) {
    throw new AppError(tAlerts("invalid_pagination") || "Invalid page or limit", 422);
  }

  const pageNum = Math.max(1, rawPage || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, rawLimit || 12));

  const skip = (pageNum - 1) * limitNum;

  const [partners, totalCount] = await Promise.all([
    Organisation.find(query)
      .select("-password")
      .sort({ isPinned: -1, pinnedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Organisation.countDocuments(query),
  ]);

  sendResponse(res, 200, "Public partners retrieved successfully", partners, {
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
  });
});
