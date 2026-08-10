import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { getPartnerRatingSummary } from "../../utils/reviews/recomputePartnerRating.js";
import { buildReviewQuery, listReviews, resolvePaging } from "./shared/reviewQuery.js";

const DEFAULT_LIMIT = 15;

/**
 * @desc    List the reviews left for the authenticated partner — own only.
 * @route   GET /api/partner/reviews
 * @access  Private — partner (organization.reviews.view)
 */
export const getPartnerOwnReviews = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const { search, rating, visibility } = req.query as Record<string, string>;
    const { page, limit } = resolvePaging(
      req.query.page,
      req.query.limit,
      DEFAULT_LIMIT,
    );

    // The partner id comes from the signed token only. The route has no :id
    // segment and the strict query schema rejects `partner`/`partnerId`, so
    // there is nothing a caller can tamper with to reach another partner.
    const query = await buildReviewQuery({
      search,
      rating: rating ? Number(rating) : undefined,
      visibility: visibility as "all" | "visible" | "hidden" | undefined,
      partnerId: req.user.id,
    });

    const [{ rows, totalCount }, summary] = await Promise.all([
      listReviews(query, page, limit),
      getPartnerRatingSummary(req.user.id),
    ]);

    sendResponse(res, 200, "Reviews fetched successfully", rows, {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      summary,
    });
  },
);
