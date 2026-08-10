import Review from "../../../modules/review.modules.js";
import Organisation from "../../../modules/organization.modules.js";
import User from "../../../modules/user.modules.js";
import { escapeRegex } from "../../../utils/apiResponse.js";

export const MAX_LIMIT = 50;

/** Same loose shape the other list controllers build their filters with. */
export type ReviewQuery = Record<string, unknown>;

export interface ReviewFilterInput {
  search?: string;
  /**
   * Always supplied by the caller. The partner-scoped controller passes
   * `req.user.id`; this helper never reads the request itself, so there is no
   * path by which a client value can leak in.
   */
  partnerId?: string;
  partnerType?: string;
  rating?: number;
  visibility?: "all" | "visible" | "hidden";
  /** Forces `isVisible: true` regardless of `visibility` — the public list. */
  visibleOnly?: boolean;
}

/**
 * Translates list filters into a Mongo filter. Shared by the admin list, the
 * partner's own list and the public list so the filtering rules exist once.
 */
export const buildReviewQuery = async ({
  search,
  partnerId,
  partnerType,
  rating,
  visibility,
  visibleOnly,
}: ReviewFilterInput): Promise<ReviewQuery> => {
  const query: ReviewQuery = {};

  if (partnerId) query.partner = partnerId;
  if (rating) query.rating = rating;

  if (visibleOnly) {
    query.isVisible = true;
  } else if (visibility === "visible") {
    query.isVisible = true;
  } else if (visibility === "hidden") {
    query.isVisible = false;
  }

  // Narrow by organisation type — resolve the matching organisations first.
  // Combined with an explicit partnerId this stays an intersection.
  if (partnerType) {
    const orgs = await Organisation.find({ partnerType })
      .select("_id")
      .lean();
    const ids = orgs.map((o) => o._id);
    query.partner = partnerId
      ? { $in: ids.filter((id) => String(id) === String(partnerId)) }
      : { $in: ids };
  }

  if (search) {
    const rx = { $regex: escapeRegex(String(search)), $options: "i" };
    const authors = await User.find({
      $or: [{ nameGe: rx }, { nameEn: rx }, { email: rx }],
    })
      .select("_id")
      .lean();
    query.$or = [{ comment: rx }, { user: { $in: authors.map((u) => u._id) } }];
  }

  return query;
};

export interface ListReviewsResult {
  rows: unknown[];
  totalCount: number;
}

/**
 * Runs a review listing: newest first, paginated, with the author and the
 * organisation populated. `authorFields` is narrowed for the public list so a
 * reviewer's email is never exposed to anonymous visitors.
 */
export const listReviews = async (
  query: ReviewQuery,
  page: number,
  limit: number,
  authorFields = "nameGe nameEn email profileImage",
): Promise<ListReviewsResult> => {
  const skip = (page - 1) * limit;

  const [rows, totalCount] = await Promise.all([
    Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "user", select: authorFields })
      .populate({
        path: "partner",
        select: "companyNameGe companyNameEn partnerType profilePhoto",
      })
      .lean(),
    Review.countDocuments(query),
  ]);

  return { rows, totalCount };
};

/** Clamps the paging params the same way every other list controller does. */
export const resolvePaging = (
  rawPage: unknown,
  rawLimit: unknown,
  defaultLimit: number,
) => {
  const page = Math.max(1, parseInt(String(rawPage), 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(rawLimit), 10) || defaultLimit),
  );
  return { page, limit };
};
