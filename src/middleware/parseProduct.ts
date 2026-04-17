import { Request, Response, NextFunction } from "express";
import { customParse } from "../utils/product.utils.js";

/**
 * Middleware to parse multipart/form-data strings into appropriate types for Products.
 * Should be used AFTER multer and BEFORE zod validation.
 */
export const parseProductData = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body) {
    const fieldsToParse = [
      "tagsGe",
      "tagsEn",
      "materialsGe",
      "materialsEn",
      "price",
      "stockQuantity",
      "shippingPrice",
      "weight",
      "isOneOfAKind",
      "shippingAvailable",
      "isShown",
    ];

    fieldsToParse.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.body[field] = customParse(req.body[field]);

        // Coerce numbers specifically if they are strings after customParse fails to JSON.parse
        if (
          ["price", "stockQuantity", "shippingPrice", "weight"].includes(
            field,
          ) &&
          typeof req.body[field] === "string"
        ) {
          const num = Number(req.body[field]);
          if (!isNaN(num)) {
            req.body[field] = num;
          }
        }
      }
    });
  }
  next();
};
