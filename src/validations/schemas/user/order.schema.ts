import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid_id");

export const checkoutSchema = {
  body: z
    .object({
      addressId: objectId,
      contact: z
        .object({
          person: z
            .string()
            .trim()
            .min(1, "contactPerson_required")
            .min(2, "contactPerson_min_length")
            .max(100, "contactPerson_max_length"),
          email: z
            .string()
            .trim()
            .min(1, "email_required")
            .email("email_invalid")
            .max(150, "email_max_length"),
          phone: z
            .string()
            .trim()
            .min(3, "phone_invalid")
            .max(30, "phone_invalid"),
        })
        .strict(),
    })
    .strict(),
};

export const orderIdParamSchema = {
  params: z.object({ id: objectId }),
};
