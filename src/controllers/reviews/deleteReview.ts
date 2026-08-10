import type { Request, Response } from "express";
import Review from "../../modules/review.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { recomputePartnerRating } from "../../utils/reviews/recomputePartnerRating.js";
import { logAdminAction } from "../../utils/audit/logAdminAction.js";

/**
 * @desc    Permanently delete a review.
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private — admin (reviews.delete)
 */
export const deleteReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const review = await Review.findByIdAndDelete(id).lean();
    if (!review) {
      throw new AppError(tAlerts("review_not_found") || "Review not found", 404);
    }

    await recomputePartnerRating(String(review.partner));
    logAdminAction(req, "REVIEW_DELETED", "Review", String(id), {
      partner: String(review.partner),
      rating: review.rating,
    });

    sendResponse(res, 200, tAlerts("review_deleted") || "Review deleted");
  },
);
