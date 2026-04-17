import Organisation from "../../modules/organization.modules.js";
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
  const { search, page = "1", limit = "12", city, category, minRating } = req.query;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  const query: any = {
    status: PartnerStatusEnum.APPROVED,
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
    query.category = category;
  }

  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit as string, 10) || 12));

  if (pageNum < 1 || limitNum < 1) {
    throw new AppError(tAlerts("invalid_pagination") || "Invalid page or limit", 422);
  }

  const skip = (pageNum - 1) * limitNum;

  const [partners, totalCount] = await Promise.all([
    Organisation.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
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
