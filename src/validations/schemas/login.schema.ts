import { z } from "zod";

/**
 * Login schema for both User and Admin.
 * Handles email (format, length) and password (length).
 */
export const loginSchema = {
  body: z
    .object({
      email: z
        .string()
        .trim()
        .min(1, "email_required")
        .email("email_invalid")
        .max(255, "email_too_long"),
      password: z
        .string()
        .min(1, "password_required")
        .max(100, "password_too_long"),
    })
    .strict(),
};
