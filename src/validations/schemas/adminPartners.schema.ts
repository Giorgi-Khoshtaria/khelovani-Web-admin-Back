import { z } from "zod";

/**
 * Partner status update schema.
 */
export const statusUpdateSchema = {
  body: z
    .object({
      status: z.enum(["PENDING", "APPROVED", "BANNED"]),
    }),
};

/**
 * Bulk delete partners schema.
 */
export const bulkDeletePartnersSchema = {
  body: z
    .object({
      ids: z
        .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid_partner_id"))
        .min(1, "at_least_one_id_required"),
    })
    .strict(),
};
