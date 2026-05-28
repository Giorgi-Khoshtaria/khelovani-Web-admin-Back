import { z } from "zod";

export const profileUpdateSchema = {
  body: z
    .object({
      idNumber: z
        .string()
        .trim()
        .min(1, "idNumber_required")
        .regex(/^\d+$/, "idNumber_only_numbers")
        .length(11, "idNumber_invalid"),

      nameGe: z
        .string()
        .trim()
        .min(2, "name_ge_min_length")
        .max(100, "name_ge_max_length")
        .regex(/^[ა-ჿ\s'-]+$/, "name_ge_letters_only")
        .optional(),

      nameEn: z
        .string()
        .trim()
        .min(1, "name_en_required")
        .min(2, "name_en_min_length")
        .max(100, "name_en_max_length")
        .regex(/^[A-Za-z\s'\-']+$/, "name_en_letters_only"),

      email: z
        .string()
        .trim()
        .min(1, "email_required")
        .email("email_invalid")
        .max(150, "email_too_long"),

      phone: z
        .string()
        .trim()
        .min(1, "phone_required")
        .max(40, "phone_too_long")
        .regex(/^(\+?995\s?)?5\d{2}\s?\d{3}\s?\d{3}$/, "phone_invalid"),
    })
    .strict(),
};
