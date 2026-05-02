import { z } from "zod";

const georgianRegex = /^[ა-ჰ0-9\s.,/\\\-()!?:;$%&*#@]+$/;
const englishRegex = /^[a-zA-Z0-9\s.,/\\\-()!?:;$%&*#@]+$/;

/**
 * Product / Item validation schema.
 * Replaces validateAddProduct and validateAddItem.
 */
export const productSchema = {
  body: z
    .object({
      titleGe: z
        .string()
        .trim()
        .min(3, "titleGe_min")
        .max(100, "titleGe_max")
        .regex(georgianRegex, "titleGe_georgian"),

      titleEn: z
        .string()
        .trim()
        .min(3, "titleEn_min")
        .max(100, "titleEn_max")
        .regex(englishRegex, "titleEn_english"),

      descriptionGe: z
        .string()
        .trim()
        .min(10, "descriptionGe_min")
        .max(2000, "descriptionGe_max")
        .regex(georgianRegex, "descriptionGe_georgian"),

      descriptionEn: z
        .string()
        .trim()
        .min(10, "descriptionEn_min")
        .max(2000, "descriptionEn_max")
        .regex(englishRegex, "descriptionEn_english"),

      category: z.string().trim().min(1, "category_required"),

      price: z.number().positive("invalid_price"),

      stockQuantity: z.number().min(0, "invalid_stock"),

      currency: z.string().trim().optional().default("GEL"),

      locationGe: z
        .string()
        .trim()
        .min(2, "locationGe_min")
        .max(100, "locationGe_max")
        .regex(georgianRegex, "locationGe_georgian")
        .optional()
        .or(z.literal("")),

      locationEn: z
        .string()
        .trim()
        .min(2, "locationEn_min")
        .max(100, "locationEn_max")
        .regex(englishRegex, "locationEn_english")
        .optional()
        .or(z.literal("")),

      tagsGe: z
        .array(
          z
            .string()
            .min(3, "tags_item_min")
            .max(30, "tags_item_max")
            .regex(georgianRegex, "tags_alphabet"),
        )
        .min(1, "tags_min_count")
        .max(10, "tags_max_count"),

      tagsEn: z
        .array(
          z
            .string()
            .min(3, "tags_item_min")
            .max(30, "tags_item_max")
            .regex(englishRegex, "tags_alphabet"),
        )
        .min(1, "tags_min_count")
        .max(10, "tags_max_count"),

      materialsGe: z
        .array(
          z
            .string()
            .min(3, "materials_item_min")
            .max(30, "materials_item_max")
            .regex(georgianRegex, "materials_alphabet"),
        )
        .min(1, "materials_min_count")
        .max(10, "materials_max_count"),

      materialsEn: z
        .array(
          z
            .string()
            .min(3, "materials_item_min")
            .max(30, "materials_item_max")
            .regex(englishRegex, "materials_alphabet"),
        )
        .min(1, "materials_min_count")
        .max(10, "materials_max_count"),

      condition: z.enum(["new", "handmade", "vintage"]),

      shippingPrice: z.number().min(0, "invalid_shipping_price").optional(),

      dimensions: z.string().trim().optional().or(z.literal("")),
      weight: z.number().positive("invalid_weight").optional(),
      shippingAvailable: z.boolean().optional().default(true),
      isShown: z.boolean().optional().default(false),
      isOneOfAKind: z.boolean().optional().default(false),
    })
    .strict(),
};

/**
 * Partial schema for updating products.
 */
export const updateProductSchema = {
  body: productSchema.body.partial(),
};

export const pinProductSchema = {
  body: z.object({ isPinned: z.boolean() }),
};
