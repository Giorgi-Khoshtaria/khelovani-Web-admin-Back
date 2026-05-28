import { z } from "zod";

const currentYear = new Date().getFullYear();

export const addPaymentCardSchema = {
  body: z
    .object({
      holderName: z
        .string()
        .min(1, "holder_name_required")
        .max(60, "holder_name_too_long"),
      brand: z.enum(["visa", "mastercard", "amex", "other"], {
        message: "invalid_card_brand",
      }),
      last4: z.string().regex(/^\d{4}$/, "invalid_last4"),
      expMonth: z
        .number({ message: "invalid_exp_month" })
        .int()
        .min(1, "invalid_exp_month")
        .max(12, "invalid_exp_month"),
      expYear: z
        .number({ message: "invalid_exp_year" })
        .int()
        .min(currentYear, "card_expired")
        .max(currentYear + 20, "invalid_exp_year"),
      isDefault: z.boolean().optional(),
    })
    .strict()
    .refine(
      (data) =>
        data.expYear > currentYear ||
        data.expMonth >= new Date().getMonth() + 1,
      { path: ["expMonth"], message: "card_expired" },
    ),
};
