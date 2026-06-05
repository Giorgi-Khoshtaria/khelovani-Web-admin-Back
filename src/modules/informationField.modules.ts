import mongoose, { Schema, Document } from "mongoose";

/**
 * Supported value types for an information field.
 * Keep this enum in sync with the admin frontend
 * (Khelovani-Admin-Front/src/types/informationField.types.ts).
 */
export const InformationFieldType = {
  Text: "text",
  Number: "number",
  Date: "date",
  Upload: "upload",
} as const;

export type InformationFieldType =
  (typeof InformationFieldType)[keyof typeof InformationFieldType];

export const INFORMATION_FIELD_TYPES = Object.values(InformationFieldType);

export interface IInformationField extends Document {
  key: string;
  type: InformationFieldType;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const informationFieldSchema = new Schema<IInformationField>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: INFORMATION_FIELD_TYPES,
      required: true,
      default: InformationFieldType.Text,
    },
    value: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const InformationField = mongoose.model<IInformationField>(
  "InformationField",
  informationFieldSchema
);

export default InformationField;
