import { z } from "zod";

const baseBody = z.object({
  name: z.string()
    .trim()
    .min(2, "name_too_short")
    .max(100, "name_too_long")
    .regex(/^[a-zA-Z0-9._\s-]+$/, "name_invalid_characters"),
  allowedPanels: z.array(z.enum(["admin", "admin-organization"]))
    .min(1, "at_least_one_panel_required")
    .optional(),
  permissions: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid_permission_id"))
    .optional(),
  description: z.string()
    .max(500, "description_too_long")
    .regex(/^[^<>]*$/, "description_invalid_characters")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().optional(),
});

/**
 * Role validation schema.
 */
export const roleSchema = {
  body: baseBody.extend({
    allowedPanels: baseBody.shape.allowedPanels.default(["admin"]),
    permissions: baseBody.shape.permissions.default([]),
    isActive: baseBody.shape.isActive.default(true),
  })
};

/**
 * Partial schema for updating roles.
 */
export const updateRoleSchema = {
  body: baseBody.partial().refine((data: Record<string, any>) => Object.keys(data).length > 0, {
    message: "empty_update_body",
  }),
};
