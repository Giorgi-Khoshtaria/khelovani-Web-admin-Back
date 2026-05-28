import { z } from "zod";
import { PIN_SECTIONS } from "../../../types/productPin.js";
import { isMalicious } from "../../../utils/security/isMalicious.js";

const noMalicious = (v: string) => !isMalicious(v);

const georgianRegex = /^[ა-ჰ0-9\s.,/\\\-()!?:;$%&*#@]+$/;
const englishRegex = /^[a-zA-Z0-9\s.,/\\\-()!?:;$%&*#@]+$/;

// Base object — no refinements so .partial() works on it
const productBaseObject = z.object({
  titleGe: z.string().trim().min(3, "titleGe_min").max(100, "titleGe_max").regex(georgianRegex, "titleGe_georgian"),
  titleEn: z.string().trim().min(3, "titleEn_min").max(100, "titleEn_max").regex(englishRegex, "titleEn_english"),
  descriptionGe: z.string().trim().min(10, "descriptionGe_min").max(2000, "descriptionGe_max").regex(/[ა-ჰ]/, "descriptionGe_georgian").regex(/^[^<>]*$/, "HTML tags are not allowed in description").refine(noMalicious, "invalid_content"),
  descriptionEn: z.string().trim().min(10, "descriptionEn_min").max(2000, "descriptionEn_max").regex(/[a-zA-Z]/, "descriptionEn_english").regex(/^[^<>]*$/, "HTML tags are not allowed in description").refine(noMalicious, "invalid_content"),
  category: z.string().trim().min(1, "category_required"),
  price: z.number().positive("invalid_price"),
  stockQuantity: z.number().min(0, "invalid_stock"),
  currency: z.string().trim().optional().default("GEL"),
  locationGe: z.string().trim().min(2, "locationGe_min").max(100, "locationGe_max").regex(georgianRegex, "locationGe_georgian").refine(noMalicious, "invalid_content").optional().or(z.literal("")),
  locationEn: z.string().trim().min(2, "locationEn_min").max(100, "locationEn_max").regex(englishRegex, "locationEn_english").refine(noMalicious, "invalid_content").optional().or(z.literal("")),
  tagsGe: z.array(z.string().min(3, "tags_item_min").max(30, "tags_item_max").regex(georgianRegex, "tags_alphabet")).min(1, "tags_min_count").max(10, "tags_max_count"),
  tagsEn: z.array(z.string().min(3, "tags_item_min").max(30, "tags_item_max").regex(englishRegex, "tags_alphabet")).min(1, "tags_min_count").max(10, "tags_max_count"),
  materialsGe: z.array(z.string().min(3, "materials_item_min").max(30, "materials_item_max").regex(georgianRegex, "materials_alphabet")).min(1, "materials_min_count").max(10, "materials_max_count"),
  materialsEn: z.array(z.string().min(3, "materials_item_min").max(30, "materials_item_max").regex(englishRegex, "materials_alphabet")).min(1, "materials_min_count").max(10, "materials_max_count"),
  condition: z.enum(["handmade", "made_to_order", "limited_edition", "one_of_a_kind", "restored", "upcycled"] as const),
  shippingPrice: z.number().min(0, "invalid_shipping_price").optional(),
  dimensions: z.string().trim().refine(noMalicious, "invalid_content").optional().or(z.literal("")),
  weight: z.number().positive("invalid_weight").optional(),
  shippingAvailable: z.boolean().optional().default(true),
  isShown: z.boolean().optional().default(false),
  isOneOfAKind: z.boolean().optional().default(false),
  isOnSale: z.boolean().optional().default(false),
  // 0 or null/undefined → coerced to null (not on sale)
  discountPercent: z
    .union([z.number().int().min(1, "discount_min_1").max(99, "discount_max_99"), z.literal(0), z.null()])
    .optional()
    .transform((v) => (v === 0 || v == null ? null : v)),
}).strict();

function applyCrossFieldRefinements<T extends z.ZodObject<any, any>>(schema: T) {
  return schema
    .superRefine((data: any, ctx: z.RefinementCtx) => {
      // ── Sale / discount coupling ─────────────────────────────────────
      if (data.isOnSale && data.discountPercent == null) {
        ctx.addIssue({
          code: "custom",
          message: "discount_required_when_on_sale",
          path: ["discountPercent"],
        });
      }

      // ── condition "one_of_a_kind" ⇒ stockQuantity must stay ≤ 1 ─────
      // Driven by the condition field (single source of truth on the
      // frontend); only fires when the offending combination is present.
      if (
        data.condition === "one_of_a_kind" &&
        typeof data.stockQuantity === "number" &&
        data.stockQuantity > 1
      ) {
        ctx.addIssue({
          code: "custom",
          message: "one_of_a_kind_must_be_single",
          path: ["stockQuantity"],
        });
      }
    })
    .transform((data: any) => {
      // Setting a discount implies isOnSale.
      if (data.discountPercent != null && !data.isOnSale) {
        data = { ...data, isOnSale: true };
      }
      // Mirror condition into the boolean flag and pin stock to 1 so the
      // DB is always internally consistent regardless of what the client
      // sent for isOneOfAKind / stockQuantity.
      if (data.condition === "one_of_a_kind") {
        data = {
          ...data,
          isOneOfAKind: true,
          stockQuantity:
            data.stockQuantity == null || data.stockQuantity < 1
              ? 1
              : data.stockQuantity,
        };
      } else if (data.isOneOfAKind === true) {
        // Condition was changed away from one_of_a_kind — clear the flag.
        data = { ...data, isOneOfAKind: false };
      }
      return data;
    });
}

export const productSchema = {
  body: applyCrossFieldRefinements(productBaseObject),
};

export const updateProductSchema = {
  body: applyCrossFieldRefinements(
    productBaseObject
      .partial()
      .extend({ keepImages: z.array(z.string()).or(z.string()).optional() }),
  ),
};

export const pinProductSchema = {
  body: z.object({
    pinSection: z
      .enum(PIN_SECTIONS as [string, ...string[]])
      .nullable()
      .refine((v) => v === null || PIN_SECTIONS.includes(v as any), "invalid_pin_section"),
  }),
};
