import type { Request, Response } from "express";
import Review from "../../modules/review.modules.js";
import Organisation from "../../modules/organization.modules.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { getPartnerRatingSummary } from "../../utils/reviews/recomputePartnerRating.js";
import { buildReviewQuery, listReviews, resolvePaging } from "./shared/reviewQuery.js";

const DEFAULT_LIMIT = 10;

/**
 * @desc    Public, paginated list of a partner's visible reviews. When a user
 *          is logged in, `meta.myReview` carries their own review so the rate
 *          modal can prefill for editing without a second request.
 * @route   GET /api/partner/:id/reviews
 * @access  Public (optionally authenticated)
 */
export const getPublicPartnerReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const partner = await Organisation.findOne({
      _id: id,
      status: PartnerStatusEnum.APPROVED,
      isShown: true,
    }).select("_id");

    if (!partner) {
      throw new AppError(
        tAlerts("partner_not_found") || "Partner not found",
        404,
      );
    }

    const { page, limit } = resolvePaging(
      req.query.page,
      req.query.limit,
      DEFAULT_LIMIT,
    );

    const query = await buildReviewQuery({
      partnerId: String(partner._id),
      visibleOnly: true,
    });

    const [{ rows, totalCount }, summary] = await Promise.all([
      // Reviewer emails are never exposed publicly.
      listReviews(query, page, limit, "nameGe nameEn profileImage"),
      getPartnerRatingSummary(String(partner._id)),
    ]);

    // `cacheRoute` skips any request carrying `req.user`, so this personalised
    // branch never lands in a shared cache entry.
    const myReview = req.user?.id
      ? await Review.findOne({ user: req.user.id, partner: partner._id })
          .select("rating comment isVisible createdAt updatedAt")
          .lean()
      : null;

    sendResponse(res, 200, "Reviews fetched successfully", rows, {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      summary,
      myReview,
    });
  },
);
