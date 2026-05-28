import { z } from "zod";

const objectId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "invalid_product_id");

export const addToCartSchema = {
  body: z
    .object({
      productId: objectId,
      quantity: z
        .number({ message: "invalid_quantity" })
        .int()
        .min(1, "invalid_quantity")
        .max(99, "invalid_quantity")
        .optional(),
    })
    .strict(),
};

export const updateCartItemSchema = {
  body: z
    .object({
      quantity: z
        .number({ message: "invalid_quantity" })
        .int()
        .min(1, "invalid_quantity")
        .max(99, "invalid_quantity"),
    })
    .strict(),
};

export const mergeCartSchema = {
  body: z
    .object({
      items: z
        .array(
          z
            .object({
              productId: objectId,
              quantity: z
                .number({ message: "invalid_quantity" })
                .int()
                .min(1, "invalid_quantity")
                .max(99, "invalid_quantity"),
            })
            .strict(),
        )
        .max(100, "cart_too_large"),
    })
    .strict(),
};
