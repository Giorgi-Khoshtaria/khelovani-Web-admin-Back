import { z } from "zod";

/**
 * Menu Item validation schema.
 */
export const menuSchema = {
  body: z
    .object({
      label: z.object({
        ka: z
          .string()
          .trim()
          .min(2, "label_ka_min_length")
          .max(20, "label_ka_max_length")
          .regex(/^[ა-ჰ0-9\s\-_]+$/, "label_ka_invalid"),
        en: z
          .string()
          .trim()
          .min(2, "label_en_min_length")
          .max(20, "label_en_max_length")
          .regex(/^[a-zA-Z0-9\s\-_]+$/, "label_en_invalid"),
      }),
      href: z
        .string()
        .trim()
        .min(1, "href_required")
        .max(20, "href_max_length")
        .startsWith("/", "href_invalid")
        .regex(/^\/[a-zA-Z0-9/\-._]*$/, "href_invalid_format"),
      order: z.number().min(0, "order_invalid"),
      isActive: z.boolean().optional(),
    })
    .strict(),
};

export const updateMenuSchema = {
  body: menuSchema.body.partial(),
};
