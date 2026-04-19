import { z } from "zod";

export const forgotPasswordSchema = {
  body: z
    .object({
      email: z
        .string()
        .trim()
        .min(1, "email_required")
        .email("email_invalid")
        .max(150, "email_too_long"),
    })
    .strict(),
};

export const resetPasswordSchema = {
  body: z
    .object({
      token: z
        .string()
        .trim()
        .min(1, "token_required")
        .max(512, "token_too_long"),
      password: z
        .string()
        .min(1, "password_required")
        .min(8, "password_min_length")
        .max(64, "password_max_length")
        .refine((val) => /[A-Z]/.test(val), { message: "password_needs_uppercase" })
        .refine((val) => /[a-z]/.test(val), { message: "password_needs_lowercase" })
        .refine((val) => /[0-9]/.test(val), { message: "password_needs_digit" })
        .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
          message: "password_needs_special",
        }),
    })
    .strict(),
};
