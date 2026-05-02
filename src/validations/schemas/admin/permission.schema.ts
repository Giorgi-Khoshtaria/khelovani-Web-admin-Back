import { z } from "zod";

const baseBody = z.object({
  name: z.string().trim().min(2, "name_too_short").max(100, "name_too_long").regex(/^[a-zA-Z0-9._\s-]+$/, "name_invalid_characters"),
  description: z.string().trim().max(1000, "description_too_long").regex(/^[^<>]*$/, "description_invalid_characters").optional(),
  category: z.string().trim().optional(),
});

/**
 * Permission validation schema.
 */
export const permissionSchema = {
  body: baseBody.extend({
    category: baseBody.shape.category.default("General"),
  }),
};

/**
 * Partial schema for updating permissions.
 */
export const updatePermissionSchema = {
  body: baseBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: "empty_update_body",
  }),
};
