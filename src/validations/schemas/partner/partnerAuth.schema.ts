import { z } from "zod";
import { PartnerTypeEnum } from "../../../types/partnerTypes.js";

const VALID_CITIES = [
  "tbilisi",
  "batumi",
  "kutaisi",
  "rustavi",
  "gori",
  "zugdidi",
] as const;

const sharedFields = {
  companyNameGe: z
    .string()
    .trim()
    .min(2, "name_ge_min_length")
    .max(100, "name_ge_max_length")
    .regex(/^[ა-ჿ\s'-]+$/, "name_ge_letters_only"),

  companyNameEn: z
    .string()
    .trim()
    .min(1, "companyNameEn_required")
    .max(100, "companyNameEn_max_length")
    .regex(/^[A-Za-z0-9\s&.,'-]+$/, "companyNameEn_invalid"),

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

  addressEn: z
    .string()
    .trim()
    .max(200, "addressEn_max_length")
    .optional()
    .or(z.literal("")),

  description: z.string().max(500, "description_max_length").optional().or(z.literal("")),
  descriptionEn: z.string().max(500, "descriptionEn_max_length").optional().or(z.literal("")),
  website: z.string().url("website_invalid").optional().or(z.literal("")),
  facebook: z.string().url("facebook_invalid").optional().or(z.literal("")),
  instagram: z.string().url("instagram_invalid").optional().or(z.literal("")),
  tiktok: z.string().url("tiktok_invalid").optional().or(z.literal("")),
  categories: z
    .array(z.string().trim().min(1))
    .min(1, "category_required")
    .max(5, "category_too_many")
    .optional(),
  password: z.string().min(6, "password_min_length").optional(),
  role: z.string().regex(/^[a-f\d]{24}$/i, "invalid_role_id").optional(),
};

/**
 * Admin update schema — partial, covers both org and individual fields.
 */
export const orgSchema = {
  body: z
    .object({
      ...sharedFields,
      identificationCode: z
        .string()
        .trim()
        .regex(/^\d+$/, "id_code_only_numbers_org")
        .length(9, "id_code_invalid_org")
        .optional(),
      personalNumber: z
        .string()
        .trim()
        .regex(/^\d+$/, "personal_number_only_numbers")
        .length(11, "personal_number_invalid")
        .optional(),
      contactPerson: z
        .string()
        .trim()
        .min(2, "contactPerson_min_length")
        .max(100, "contactPerson_max_length")
        .optional(),
    })
    .partial(),
};

const sharedRegistrationFields = {
  companyNameGe: z.string().trim().min(1, "companyNameGe_required").max(100, "companyNameGe_max_length"),
  companyNameEn: z.string().trim().min(1, "companyNameEn_required").max(100, "companyNameEn_max_length"),
  phone: z
    .string()
    .trim()
    .min(1, "phone_required")
    .regex(/^5\d{2}\s?\d{3}\s?\d{3}$/, "phone_invalid"),
  city: z.enum(VALID_CITIES),
  categories: z
    .array(z.string().trim().min(1))
    .min(1, "category_required")
    .max(5, "category_too_many"),
  email: z.string().trim().min(1, "email_required").email("email_invalid").max(254, "email_too_long"),
  address: z
    .string()
    .trim()
    .min(1, "address_required")
    .max(200, "address_max_length")
    .regex(/^[ა-ჰ0-9\s.,/\\\-()]+$/, "address_needs_georgian"),
  addressEn: z
    .string()
    .trim()
    .min(1, "addressEn_required")
    .max(200, "addressEn_max_length")
    .regex(/^[a-zA-Z0-9\s.,/\\\-()]+$/, "addressEn_needs_english"),
  description: z.string().max(500, "description_max_length").optional().or(z.literal("")),
  descriptionEn: z.string().max(500, "description_max_length").optional().or(z.literal("")),
  website: z.string().url("website_invalid").regex(/^https?:\/\//, "website_invalid").optional().or(z.literal("")),
  facebook: z.string().url("facebook_invalid").optional().or(z.literal("")),
  instagram: z.string().url("instagram_invalid").optional().or(z.literal("")),
  tiktok: z.string().url("tiktok_invalid").optional().or(z.literal("")),
  terms: z.boolean().refine((val) => val === true, { message: "terms_required" }),
};

const organizationBranch = z.object({
  partnerType: z.literal(PartnerTypeEnum.ORGANIZATION),
  identificationCode: z
    .string()
    .trim()
    .min(1, "id_code_required")
    .regex(/^\d+$/, "id_code_only_numbers_org")
    .length(9, "id_code_invalid_org"),
  contactPerson: z.string().trim().min(1, "contactPerson_required").max(100, "contactPerson_max_length"),
  ...sharedRegistrationFields,
});

const individualBranch = z.object({
  partnerType: z.literal(PartnerTypeEnum.INDIVIDUAL),
  personalNumber: z
    .string()
    .trim()
    .min(1, "id_number_required")
    .regex(/^\d+$/, "id_number_only_numbers")
    .length(11, "id_number_invalid"),
  ...sharedRegistrationFields,
});

/**
 * Partner Registration schema — discriminated union on partnerType.
 * Missing partnerType defaults to organization branch (back-compat).
 */
export const partnerRegistrationSchema = {
  body: z.discriminatedUnion("partnerType", [organizationBranch, individualBranch]),
};
