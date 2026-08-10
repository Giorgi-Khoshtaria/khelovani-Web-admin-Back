import { z } from "zod";
import { PartnerTypeEnum } from "../../../types/partnerTypes.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid_id");

/** Controllers read `req.query.lang`, so every strict query schema must keep it. */
const lang = z.enum(["ge", "en"]).optional();

const page = z.coerce.number().int().min(1, "invalid_page").optional();
const limit = z.coerce.number().int().min(1, "invalid_limit").optional();

const ratingFilter = z.coerce
  .number()
  .int()
  .min(1, "rating_invalid")
  .max(5, "rating_invalid")
  .optional();

/**
 * "all" is what the admin/partner UI selects sit at by default. The front ends
 * strip it before sending, but accept it here so a stray value is a no-op
 * filter rather than a 422.
 */
const visibilityFilter = z.enum(["all", "visible", "hidden"]).optional();

/** Body + params for POST /api/partner/:id/reviews (the rate-partner modal). */
export const createReviewSchema = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      rating: z.coerce
        .number()
        .int("rating_invalid")
        .min(1, "rating_required")
        .max(5, "rating_invalid"),
      comment: z
        .string()
        .trim()
        .min(10, "review_comment_too_short")
        .max(600, "review_comment_too_long"),
    })
    .strict(),
};

/** GET /api/partner/:id/reviews — public, paginated. */
export const publicReviewListSchema = {
  params: z.object({ id: objectId }),
  query: z.object({ page, limit, lang }).strict(),
};

/**
 * GET /api/partner/reviews — the partner's own reviews.
 *
 * Deliberately has NO `partner` / `partnerId` key: `.strict()` turns any
 * attempt to target another organisation into a 422 before the controller
 * runs. The partner id comes exclusively from the JWT.
 */
export const partnerReviewListSchema = {
  query: z
    .object({
      search: z.string().trim().max(120, "search_too_long").optional(),
      rating: ratingFilter,
      visibility: visibilityFilter,
      page,
      limit,
      lang,
    })
    .strict(),
};

/** GET /api/admin/reviews — every review, with organisation filters. */
export const adminReviewListSchema = {
  query: z
    .object({
      search: z.string().trim().max(120, "search_too_long").optional(),
      partnerId: objectId.optional(),
      partnerType: z.enum(Object.values(PartnerTypeEnum) as [string, ...string[]]).optional(),
      rating: ratingFilter,
      visibility: visibilityFilter,
      page,
      limit,
      lang,
    })
    .strict(),
};

/** PATCH /api/admin/reviews/:id/visibility */
export const reviewVisibilitySchema = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      // Not z.coerce.boolean() — that turns the string "false" into `true`.
      isVisible: z.union([
        z.boolean(),
        z.enum(["true", "false"]).transform((v) => v === "true"),
      ]),
    })
    .strict(),
};
