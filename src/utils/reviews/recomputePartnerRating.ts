import mongoose from "mongoose";
import Review from "../../modules/review.modules.js";
import Organisation from "../../modules/organization.modules.js";
import {
  invalidatePartnerById,
  invalidatePartnerReviews,
} from "../cache/invalidators.js";

export interface RatingSummary {
  average: number;
  total: number;
  /** Count of visible reviews per star value, keyed "1".."5". */
  breakdown: Record<string, number>;
}

const EMPTY_BREAKDOWN = (): Record<string, number> => ({
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
});

/**
 * Aggregates a partner's visible reviews into a per-star breakdown, an average
 * (1 decimal) and a total. Read-only — used by the partner panel header.
 */
export const getPartnerRatingSummary = async (
  partnerId: string,
): Promise<RatingSummary> => {
  const rows = await Review.aggregate<{ _id: number; count: number }>([
    {
      $match: {
        partner: new mongoose.Types.ObjectId(partnerId),
        isVisible: true,
      },
    },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);

  const breakdown = EMPTY_BREAKDOWN();
  let total = 0;
  let sum = 0;

  for (const row of rows) {
    breakdown[String(row._id)] = row.count;
    total += row.count;
    sum += row._id * row.count;
  }

  return {
    average: total ? Math.round((sum / total) * 10) / 10 : 0,
    total,
    breakdown,
  };
};

/**
 * The single writer of `Organisation.rating` / `reviewCount`. Every review
 * write path (create, edit, hide, unhide, delete, seed) must call this so the
 * denormalised aggregate can never drift from the review collection.
 *
 * Owns the cache invalidation too, so no caller can forget it.
 */
export const recomputePartnerRating = async (
  partnerId: string,
): Promise<RatingSummary> => {
  const summary = await getPartnerRatingSummary(partnerId);

  await Organisation.updateOne(
    { _id: partnerId },
    { $set: { rating: summary.average, reviewCount: summary.total } },
  );

  invalidatePartnerById(partnerId);
  invalidatePartnerReviews(partnerId);

  return summary;
};
