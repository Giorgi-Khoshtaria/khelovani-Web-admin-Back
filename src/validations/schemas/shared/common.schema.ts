import { z } from "zod";

/**
 * Common schema for validating IDs in request parameters.
 * Assumes MongoDB ObjectID format.
 */
export const commonParamsSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid_id_format"),
  }),
};

/**
 * Specifically for routes where the param name is not 'id' (e.g., :productId).
 */
export const productIdParamsSchema = {
  params: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid_id_format"),
  }),
};
