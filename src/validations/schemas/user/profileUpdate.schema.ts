import { z } from "zod";

const VALID_CITIES = [
  "tbilisi",
  "batumi",
  "kutaisi",
  "rustavi",
  "gori",
  "zugdidi",
] as const;

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

      dateOfBirth: z
        .string()
        .min(1, "dob_required")
        .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
          message: "dob_invalid_format",
        })
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
            return today.getFullYear() - dob.getFullYear() <= 120;
          },
          { message: "age_limit_120" },
        ),

      city: z.enum(VALID_CITIES, { message: "city_invalid" }),

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
