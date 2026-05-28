import { z } from "zod";
import { AddressType } from "../../../types/addressType.enum.js";

const addressBody = z
  .object({
    type: z.enum(AddressType, {
      message: "address_type_invalid",
    }),
    label: z
      .string()
      .trim()
      .min(1, "address_label_required")
      .min(2, "address_label_min_length")
      .max(100, "address_label_max_length"),
    addressLine: z
      .string()
      .trim()
      .min(1, "address_line_required")
      .min(5, "address_line_min_length")
      .max(200, "address_line_max_length"),
    city: z
      .string()
      .trim()
      .min(1, "address_city_required")
      .max(100, "address_city_max_length"),
    postalCode: z
      .string()
      .trim()
      .max(20, "address_postal_max_length")
      .optional()
      .or(z.literal("")),
    additionalComment: z
      .string()
      .trim()
      .max(300, "address_comment_max_length")
      .optional()
      .or(z.literal("")),
    lat: z
      .number({ message: "address_lat_invalid" })
      .min(-90, "address_lat_invalid")
      .max(90, "address_lat_invalid")
      .optional(),
    lng: z
      .number({ message: "address_lng_invalid" })
      .min(-180, "address_lng_invalid")
      .max(180, "address_lng_invalid")
      .optional(),
    formattedAddress: z
      .string()
      .trim()
      .max(300, "address_formatted_max_length")
      .optional()
      .or(z.literal("")),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const addAddressSchema = { body: addressBody };

export const updateAddressSchema = { body: addressBody };
