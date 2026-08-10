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
 * @desc    Hide or unhide a review. Hidden reviews disappear from the public
 *          list and stop counting toward the partner's average.
 * @route   PATCH /api/admin/reviews/:id/visibility
 * @access  Private — admin (reviews.moderate)
 */
export const setReviewVisibility = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isVisible } = req.body as { isVisible: boolean };
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    const review = await Review.findById(id);
    if (!review) {
      throw new AppError(tAlerts("review_not_found") || "Review not found", 404);
    }

    review.isVisible = isVisible;
    review.hiddenBy = isVisible ? null : (req.user!.id as never);
    await review.save();

    await recomputePartnerRating(String(review.partner));
    logAdminAction(req, "REVIEW_VISIBILITY_UPDATED", "Review", String(id), {
      isVisible,
      partner: String(review.partner),
    });

    sendResponse(
      res,
      200,
      tAlerts("review_updated") || "Review updated",
      review,
    );
  },
);
