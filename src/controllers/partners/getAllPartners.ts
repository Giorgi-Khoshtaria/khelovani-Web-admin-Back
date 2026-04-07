import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

// @desc    Get all partners
// @route   GET /api/partners
// @access  Private Admin
export const getAllPartners = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { search, status } = req.query;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    const query: any = {};

    if (search) {
      query.$or = [
        { companyNameGe: { $regex: search, $options: "i" } },
        { companyNameEn: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      if (!Object.values(PartnerStatusEnum).includes(status as any)) {
        res.status(422).json({ message: tAlerts("invalid_status") });
        return;
      }
      query.status = status;
    }

    const pageNum = parseInt(req.query.page as string) || 1;
    const limitNum = parseInt(req.query.limit as string) || 100;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Organisation.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    const partners = await Organisation.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      partners,
      totalCount,
      totalPages,
      currentPage: pageNum,
    });
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res.status(500).json({ message: tAlerts("server_error") || (error as Error).message });
  }
};
