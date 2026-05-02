import { z } from "zod";

/**
 * User email-only schema (e.g., for deletion by email).
 */
export const emailOnlySchema = {
  body: z
    .object({
      email: z.string().trim().email("invalid_email_format"),
    })
    .strict(),
};
