import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid_id");

/** Body for POST /api/partner/:id/contact (the "Contact artisan" modal). */
export const partnerContactSchema = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      subject: z
        .string()
        .trim()
        .min(1, "subject_required")
        .max(120, "subject_too_long"),
      message: z
        .string()
        .trim()
        .min(10, "message_too_short")
        .max(600, "message_too_long"),
    })
    .strict(),
};
