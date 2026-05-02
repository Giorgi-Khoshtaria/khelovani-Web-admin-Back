import { z } from "zod";

const GE_REGEX = /^[ა-ჰ\s''\-]+$/;
const EN_REGEX = /^[A-Za-z\s''\-]+$/;
const SLUG_REGEX = /^[a-z0-9_-]+$/;

const baseBody = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "slug_too_short")
    .max(50, "slug_too_long")
    .regex(SLUG_REGEX, "slug_invalid"),
  nameGe: z
    .string()
    .trim()
    .min(2, "nameGe_too_short")
    .max(50, "nameGe_too_long")
    .regex(GE_REGEX, "nameGe_invalid"),
  nameEn: z
    .string()
    .trim()
    .min(2, "nameEn_too_short")
    .max(50, "nameEn_too_long")
    .regex(EN_REGEX, "nameEn_invalid"),
  isActive: z.boolean().optional(),
});

export const categorySchema = { body: baseBody };

export const updateCategorySchema = {
  body: baseBody
    .partial()
    .refine((d) => Object.keys(d).length > 0, { message: "empty_update_body" }),
};
