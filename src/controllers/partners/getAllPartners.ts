import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { PartnerTypeEnum } from "../../types/partnerTypes.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

const MAX_LIMIT = 50;

// @desc    Get all partners
// @route   GET /api/partners
// @access  Private Admin
export const getAllPartners = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, partnerType } = req.query;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
  const query: any = {};

  if (search) {
    const escaped = escapeRegex(String(search));
    query.$or = [
      { companyNameGe: { $regex: escaped, $options: "i" } },
      { companyNameEn: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  if (status && status !== "all") {
    if (!Object.values(PartnerStatusEnum).includes(status as any)) {
      throw new AppError(tAlerts("invalid_status") || "Invalid status", 422);
    }
    query.status = status;
  }

  if (partnerType === PartnerTypeEnum.ORGANIZATION || partnerType === PartnerTypeEnum.INDIVIDUAL) {
    query.partnerType = partnerType;
  }

  const pageNum = Math.max(1, parseInt(req.query.page as string) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [partners, totalCount] = await Promise.all([
    Organisation.find(query)
      .select("-password")
      .sort({ isPinned: -1, pinnedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Organisation.countDocuments(query),
  ]);

  sendResponse(res, 200, "Partners fetched successfully", partners, {
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
  });
});
