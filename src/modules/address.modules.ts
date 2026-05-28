import mongoose, { Schema, Document } from "mongoose";
import { AddressType } from "../types/addressType.enum.js";

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  type: AddressType;
  label: string;
  addressLine: string;
  city: string;
  postalCode?: string;
  additionalComment?: string;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(AddressType) as AddressType[],
      required: true,
      default: AddressType.Home,
    },
    label: { type: String, required: true, trim: true, maxlength: 100 },
    addressLine: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    additionalComment: { type: String, trim: true, maxlength: 300 },
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
    formattedAddress: { type: String, trim: true, maxlength: 300 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

AddressSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IAddress>("Address", AddressSchema);
