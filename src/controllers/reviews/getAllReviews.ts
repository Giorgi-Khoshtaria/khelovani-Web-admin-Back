import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { buildReviewQuery, listReviews, resolvePaging } from "./shared/reviewQuery.js";

const DEFAULT_LIMIT = 15;

/**
 * @desc    List every review, filterable by organisation and organisation type.
 * @route   GET /api/admin/reviews
 * @access  Private — admin (reviews.viewAll)
 */
export const getAllReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { search, partnerId, partnerType, rating, visibility } =
      req.query as Record<string, string>;

    const { page, limit } = resolvePaging(
      req.query.page,
      req.query.limit,
      DEFAULT_LIMIT,
    );

    const query = await buildReviewQuery({
      search,
      partnerId,
      partnerType,
      rating: rating ? Number(rating) : undefined,
      visibility: visibility as "all" | "visible" | "hidden" | undefined,
    });

    const { rows, totalCount } = await listReviews(query, page, limit);

    sendResponse(res, 200, "Reviews fetched successfully", rows, {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  },
);
