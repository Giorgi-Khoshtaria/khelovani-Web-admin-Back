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
 * Organization Registration/Update schema.
 */
export const orgSchema = {
  body: z
    .object({
      companyNameGe: z
        .string()
        .trim()
        .min(2, "name_ge_min_length")
        .max(100, "name_ge_max_length")
        .regex(/^[\u10D0-\u10FF\s'-]+$/, "name_ge_letters_only"),

      companyNameEn: z
        .string()
        .trim()
        .min(1, "companyNameEn_required")
        .max(100, "companyNameEn_max_length")
        .regex(/^[A-Za-z0-9\s&.,'-]+$/, "companyNameEn_invalid"),

      identificationCode: z
        .string()
        .trim()
        .min(1, "id_code_required")
        .regex(/^\d{9}$/, "id_code_invalid"),

      contactPerson: z
        .string()
        .trim()
        .min(1, "contactPerson_required")
        .min(2, "contactPerson_min_length")
        .max(100, "contactPerson_max_length"),

      phone: z
        .string()
        .trim()
        .min(1, "phone_required")
        .regex(/^5\d{2}\s?\d{3}\s?\d{3}$/, "phone_invalid"),

      city: z.enum(VALID_CITIES),

      email: z
        .string()
        .trim()
        .min(1, "email_required")
        .email("email_invalid")
        .max(255, "email_too_long"),

      address: z
        .string()
        .trim()
        .min(1, "address_required")
        .min(5, "address_min_length")
        .max(200, "address_max_length"),

      description: z
        .string()
        .max(500, "description_max_length")
        .optional()
        .or(z.literal("")),
    })
    .strict(),
};

/**
 * Partner Registration schema (Self-registration).
 */
export const partnerRegistrationSchema = {
  body: z
    .object({
      companyNameGe: z.string().trim().min(1, "companyNameGe_required"),
      companyNameEn: z.string().trim().min(1, "companyNameEn_required"),
      identificationCode: z
        .string()
        .trim()
        .min(1, "id_code_required")
        .regex(/^\d{9}$/, "id_code_invalid"),
      contactPerson: z.string().trim().min(1, "contactPerson_required"),
      phone: z
        .string()
        .trim()
        .min(1, "phone_required")
        .regex(/^5\d{2}\s?\d{3}\s?\d{3}$/, "phone_invalid"),
      city: z.enum(VALID_CITIES),
      category: z.string().trim().min(1, "category_required"),
      email: z.string().trim().min(1, "email_required").email("email_invalid"),
      address: z
        .string()
        .trim()
        .min(1, "address_required")
        .regex(/^[ა-ჰ0-9\s.,/\\\-()]+$/, "address_needs_georgian"),
      addressEn: z
        .string()
        .trim()
        .min(1, "addressEn_required")
        .regex(/^[a-zA-Z0-9\s.,/\\\-()]+$/, "addressEn_needs_english"),
      description: z.string().max(500, "description_max_length").optional().or(z.literal("")),
      descriptionEn: z.string().max(500, "description_max_length").optional().or(z.literal("")),
      website: z.string().url("website_invalid").optional().or(z.literal("")),
      facebook: z.string().url("facebook_invalid").optional().or(z.literal("")),
      instagram: z.string().url("instagram_invalid").optional().or(z.literal("")),
      tiktok: z.string().url("tiktok_invalid").optional().or(z.literal("")),
      terms: z.boolean().refine((val) => val === true, {
        message: "terms_required",
      }),
    })
    .strict(),
};
