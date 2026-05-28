import mongoose, { Schema, Document } from "mongoose";
import { PartnerTypeEnum, type PartnerType } from "../types/partnerTypes.js";
import { PIN_SECTIONS, type PinSection } from "../types/productPin.js";
import { ProductCondition, PRODUCT_CONDITIONS } from "../types/productCondition.enum.js";

export interface IProduct extends Document {
  owner: mongoose.Types.ObjectId;
  ownerType: PartnerType;
  images: string[];
  titleGe: string;
  titleEn?: string;
  descriptionGe: string;
  descriptionEn?: string;
  category: string;
  tagsGe: string[];
  tagsEn?: string[];
  price: number;
  currency: string;
  stockQuantity: number;
  isOneOfAKind: boolean;
  shippingAvailable: boolean;
  shippingPrice?: number;
  locationGe: string;
  locationEn?: string;
  condition: ProductCondition;
  materialsGe: string[];
  materialsEn?: string[];
  dimensions?: string;
  weight?: number;
  isOnSale: boolean;
  discountPercent?: number;
  isShown: boolean;
  pinSection: PinSection | null;
  pinnedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    ownerType: { type: String, enum: Object.values(PartnerTypeEnum), required: true, index: true },
    images: { type: [String], required: true },
    
    titleGe: { 
      type: String, 
      required: true, 
      trim: true,
      match: [/^[ა-ჰ0-9\s.,/\\\-()!?:;$%&*#@]+$/, "Georgian title must be in Georgian alphabet"]
    },
    titleEn: { 
      type: String, 
      trim: true,
      match: [/^[a-zA-Z0-9\s.,/\\\-()!?:;$%&*#@]+$/, "English title must be in English alphabet"]
    },
    descriptionGe: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionEn: {
      type: String,
      trim: true,
    },
    
    category: {
      type: String,
      required: true,
      trim: true,
    },
    
    tagsGe: { type: [String], default: [] },
    tagsEn: { type: [String], default: [] },
    
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "GEL" },
    
    stockQuantity: { type: Number, required: true, min: 0 },
    isOneOfAKind: { type: Boolean, default: false },
    shippingAvailable: { type: Boolean, default: false },
    shippingPrice: { type: Number, min: 0 },
    
    locationGe: { type: String },
    locationEn: { type: String },
    
    condition: {
      type: String,
      enum: PRODUCT_CONDITIONS,
      required: true
    },
    materialsGe: { type: [String], default: [] },
    materialsEn: { type: [String], default: [] },
    dimensions: { type: String },
    weight: { type: Number, min: 0 },
    isOnSale: { type: Boolean, default: false, index: true },
    discountPercent: { type: Number, min: 1, max: 99, default: null },
    isShown: { type: Boolean, default: false },
    pinSection: { type: String, enum: [...PIN_SECTIONS, null], default: null, index: true },
    pinnedAt: { type: Date, default: null, sparse: true },
  },
  { timestamps: true }
);

ProductSchema.index({ ownerType: 1, status: 1, createdAt: -1 });
ProductSchema.index({ pinSection: 1, pinnedAt: -1 }, { sparse: true });
ProductSchema.index({ titleGe: "text", titleEn: "text", tagsGe: "text" });

export default mongoose.model<IProduct>("Product", ProductSchema, "items");
