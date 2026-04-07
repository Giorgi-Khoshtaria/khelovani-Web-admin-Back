import { z } from "zod";

const VALID_CITIES = [
  "tbilisi",
  "batumi",
  "kutaisi",
  "rustavi",
  "gori",
  "zugdidi",
] as const;

/**
 * Registration schema with comprehensive validation.
 * Includes all previous manual checks plus additional safety guards.
 */
export const registerSchema = {
  body: z
    .object({
      idNumber: z
        .string()
        .trim()
        .min(1, "idNumber_required")
        .regex(/^\d{11}$/, "idNumber_invalid"),

      nameGe: z
        .string()
        .trim()
        .min(2, "name_ge_min_length")
        .max(50, "name_ge_max_length")
        .regex(/^[\u10D0-\u10FF\s'-]+$/, "name_ge_letters_only")
        .optional()
        .or(z.literal("")),

      nameEn: z
        .string()
        .trim()
        .min(1, "name_en_required")
        .min(2, "name_en_min_length")
        .max(50, "name_en_max_length")
        .regex(/^[A-Za-z\s'\-’]+$/, "name_en_letters_only"),

      dateOfBirth: z
        .string()
        .min(1, "dob_required")
        .refine((val) => !isNaN(Date.parse(val)), { message: "dob_invalid" })
        .refine(
          (val) => {
            const dob = new Date(val);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (
              monthDiff < 0 ||
              (monthDiff === 0 && today.getDate() < dob.getDate())
            )
              age--;
            return age >= 16;
          },
          { message: "age_limit_16" },
        )
        .refine(
          (val) => {
            const dob = new Date(val);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            return age <= 120;
          },
          { message: "age_limit_120" },
        ),

      city: z.enum(VALID_CITIES),

      address: z
        .string()
        .trim()
        .min(1, "address_required")
        .min(5, "address_min_length")
        .max(200, "address_max_length"),

      email: z
        .string()
        .trim()
        .min(1, "email_required")
        .email("email_invalid")
        .max(255, "email_too_long"),

      phone: z
        .string()
        .trim()
        .min(1, "phone_required")
        .regex(/^5\d{2}\s?\d{3}\s?\d{3}$/, "phone_invalid"),

      password: z
        .string()
        .min(1, "password_required")
        .min(8, "password_min_length")
        .max(64, "password_max_length")
        .refine((val) => /[A-Z]/.test(val), {
          message: "password_needs_uppercase",
        })
        .refine((val) => /[a-z]/.test(val), {
          message: "password_needs_lowercase",
        })
        .refine((val) => /[0-9]/.test(val), { message: "password_needs_digit" })
        .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
          message: "password_needs_special",
        }),
    })
    .strict(),
};
