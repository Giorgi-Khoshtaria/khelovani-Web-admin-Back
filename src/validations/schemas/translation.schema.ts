import { z } from "zod";

const xssRegex = /<script|iframe|object|embed|base|style|meta|link|on\w+\s*=|javascript:/i;

/**
 * Schema for creating a NEW translation (All fields required)
 */
export const createTranslationSchema = {
  body: z.object({
    namespace: z.string()
      .trim()
      .min(1, "namespace_required"),
    key: z.string()
      .trim()
      .min(2, "key_too_short")
      .max(100, "key_too_long"),
    translations: z.object({
      ge: z.string()
        .trim()
        .min(1, "ge_translation_required")
        .max(200, "translation_too_long")
        .refine((val) => !xssRegex.test(val), "xss_detected"),
      en: z.string()
        .trim()
        .min(1, "en_translation_required")
        .max(200, "translation_too_long")
        .refine((val) => !xssRegex.test(val), "xss_detected"),
    }),
  }).strict()
};

/**
 * Schema for UPDATING an existing translation (Partial allowed, namespace/key optional)
 */
export const updateTranslationSchema = {
  body: z.object({
    namespace: z.string().trim().optional(),
    key: z.string()
      .trim()
      .min(2, "key_too_short")
      .max(100, "key_too_long")
      .optional(),
    translations: z.object({
      ge: z.string()
        .trim()
        .optional()
        .refine((val) => !val || !xssRegex.test(val), "xss_detected"),
      en: z.string()
        .trim()
        .optional()
        .refine((val) => !val || !xssRegex.test(val), "xss_detected"),
    }),
  }).strict()
};

/**
 * Bulk translation schema.
 */
export const bulkTranslationSchema = {
  body: z.object({
    items: z.array(z.object({
      namespace: z.string().trim().min(1, "namespace_required"),
      key: z.string().trim().min(2, "key_too_short").max(100, "key_too_long"),
      ge: z.string().trim().min(1, "ge_translation_required").max(200, "translation_too_long")
        .refine((val) => !xssRegex.test(val), "xss_detected"),
      en: z.string().trim().min(1, "en_translation_required").max(200, "translation_too_long")
        .refine((val) => !xssRegex.test(val), "xss_detected"),
    })).min(1, "at_least_one_translation_required"),
  }).strict()
};
