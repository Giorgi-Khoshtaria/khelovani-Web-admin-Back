import { z } from "zod";
import {
  INFORMATION_FIELD_TYPES,
  InformationFieldType,
} from "../../modules/informationField.modules.js";

const typeEnum = z.enum(
  INFORMATION_FIELD_TYPES as [string, ...string[]]
);

// Ensures `value` is consistent with the selected `type`.
const valueMatchesType = (
  data: { type?: string; value?: string },
  ctx: z.RefinementCtx
) => {
  const { type, value } = data;
  if (!type || value === undefined) return;

  // `upload` stores the Cloudinary URL of the uploaded asset, so its value
  // must be a valid URL.
  if (type === InformationFieldType.Upload) {
    try {
      new URL(value);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Value must be a valid URL",
      });
    }
  }

  if (type === InformationFieldType.Number && Number.isNaN(Number(value))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["value"],
      message: "Value must be a valid number",
    });
  }

  if (type === InformationFieldType.Date && Number.isNaN(Date.parse(value))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["value"],
      message: "Value must be a valid date",
    });
  }
};

const keySchema = z
  .string()
  .min(1, "Key is required")
  .max(100, "Key is too long")
  .regex(
    /^[a-zA-Z0-9_.-]+$/,
    "Key may only contain letters, numbers, dots, dashes and underscores"
  );

export const createInformationFieldSchema = {
  body: z
    .object({
      key: keySchema,
      type: typeEnum,
      value: z.string().min(1, "Value is required"),
      description: z.string().max(1000, "Description is too long").optional(),
    })
    .superRefine(valueMatchesType),
};

export const updateInformationFieldSchema = {
  body: z
    .object({
      key: keySchema.optional(),
      type: typeEnum.optional(),
      value: z.string().min(1, "Value is required").optional(),
      description: z.string().max(1000, "Description is too long").optional(),
    })
    .superRefine(valueMatchesType),
};
