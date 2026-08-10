import type { Request, Response } from "express";
import Review from "../../modules/review.modules.js";
import Organisation from "../../modules/organization.modules.js";
import User from "../../modules/user.modules.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { recomputePartnerRating } from "../../utils/reviews/recomputePartnerRating.js";
import { sendPartnerReviewEmail } from "../../utils/email/sendPartnerEmail.js";

/**
 * @desc    Create or edit the authenticated user's review of a partner.
 * @route   POST /api/partner/:id/reviews
 * @access  Private — end users only (one review per user per partner).
 */
export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rating, comment } = req.body as { rating: number; comment: string };
    // Only used for the tAlerts() response message — the notification email
    // always carries both languages, regardless of the caller's locale.
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const partner = await Organisation.findOne({
      _id: id,
      status: PartnerStatusEnum.APPROVED,
      isShown: true,
    }).select("companyNameGe companyNameEn email");

    if (!partner) {
      throw new AppError(
        tAlerts("partner_not_found") || "Partner not found",
        404,
      );
    }

    // `id` collides across the User / Organisation / Admin collections — an
    // organisation or admin JWT also passes `authenticate`. This lookup is
    // what proves the caller is a real end user, and so is what stops a
    // partner from rating itself or a competitor.
    const author = await User.findById(req.user.id).select(
      "nameGe nameEn email",
    );
    if (!author) {
      throw new AppError(tAlerts("user_not_found") || "User not found", 404);
    }

    const existing = await Review.findOne({
      user: author._id,
      partner: partner._id,
    }).select("_id");

    // Upsert — the unique {user, partner} index makes a double-submit race
    // impossible; re-submitting edits the existing review.
    const review = await Review.findOneAndUpdate(
      { user: author._id, partner: partner._id },
      { $set: { rating, comment, isVisible: true, hiddenBy: null } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    await recomputePartnerRating(String(partner._id));

    if (partner.email) {
      // A mail failure must never fail the request.
      try {
        await sendPartnerReviewEmail(partner.email, {
          partnerNameGe: partner.companyNameGe || partner.companyNameEn || "",
          partnerNameEn: partner.companyNameEn || partner.companyNameGe || "",
          reviewerNameGe: author.nameGe || author.nameEn || author.email,
          reviewerNameEn: author.nameEn || author.nameGe || author.email,
          reviewerEmail: author.email,
          rating,
          comment,
          isUpdate: Boolean(existing),
        });
      } catch (err) {
        console.error(
          "[reviews] failed to send review notification:",
          (err as Error).message,
        );
      }
    }

    sendResponse(
      res,
      existing ? 200 : 201,
      tAlerts("review_saved") || "Review saved",
      review,
    );
  },
);
