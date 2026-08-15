import { z } from "zod";

/**
 * Page (SEO) validation schema.
 */
export const pageSchema = {
  body: z
    .object({
      path: z
        .string()
        .trim()
        .min(1, "path_required")
        .max(100, "path_max_length")
        .startsWith("/", "path_invalid")
        .regex(/^\/[a-zA-Z0-9/\-._]*$/, "path_invalid_format"),
      title: z.object({
        ka: z.string().trim().min(2, "title_ka_min_length").max(60, "title_ka_max_length"),
        en: z.string().trim().min(2, "title_en_min_length").max(60, "title_en_max_length"),
      }),
      description: z.object({
        ka: z
          .string()
          .trim()
          .min(10, "description_ka_min_length")
          .max(160, "description_ka_max_length"),
        en: z
          .string()
          .trim()
          .min(10, "description_en_min_length")
          .max(160, "description_en_max_length"),
      }),
      ogImage: z.string().trim().optional(),
      noindex: z.boolean().optional(),
    })
    .strict(),
};

export const updatePageSchema = {
  body: pageSchema.body.partial(),
};
