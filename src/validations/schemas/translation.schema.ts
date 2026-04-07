import { z } from "zod";

/**
 * Translation validation schema.
 */
export const translationSchema = {
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
        .max(200, "translation_too_long"),
      en: z.string()
        .trim()
        .min(1, "en_translation_required")
        .max(200, "translation_too_long"),
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
      ge: z.string().trim().min(1, "ge_translation_required").max(200, "translation_too_long"),
      en: z.string().trim().min(1, "en_translation_required").max(200, "translation_too_long"),
    })).min(1, "at_least_one_translation_required"),
  }).strict()
};
