import { z } from "zod";

/**
 * Menu Item validation schema.
 */
export const menuSchema = {
  body: z.object({
    label: z.object({
      ka: z.string()
        .trim()
        .min(1, "label_ka_required")
        .min(2, "label_ka_min_length"),
      en: z.string()
        .trim()
        .min(1, "label_en_required")
        .regex(/^[a-zA-Z0-9\s\-_]+$/, "label_en_invalid"),
    }),
    href: z.string()
      .trim()
      .min(1, "href_required")
      .startsWith("/", "href_invalid"),
    order: z.number().min(0, "order_invalid"),
    isActive: z.boolean().optional(),
  }).strict()
};

export const updateMenuSchema = {
  body: menuSchema.body.partial()
};
