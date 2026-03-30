import mongoose, { Schema, Document } from "mongoose";
import { CraftCategory } from "../types/itemsCategory.enum.js";

export interface IProduct extends Document {
  owner: mongoose.Types.ObjectId;
  images: string[];
  titleGe: string;
  titleEn?: string;
  descriptionGe: string;
  descriptionEn?: string;
  category: CraftCategory;
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
  condition: "new" | "handmade" | "vintage";
  materialsGe: string[];
  materialsEn?: string[];
  dimensions?: string;
  weight?: number;
  customizable: boolean;
  isShown: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    images: { type: [String], required: true },
    
    titleGe: { type: String, required: true, trim: true },
    titleEn: { type: String, trim: true },
    descriptionGe: { type: String, required: true, trim: true },
    descriptionEn: { type: String, trim: true },
    
    category: { 
      type: String, 
      enum: Object.values(CraftCategory),
      required: true 
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
      enum: ["new", "handmade", "vintage"], 
      required: true 
    },
    materialsGe: { type: [String], default: [] },
    materialsEn: { type: [String], default: [] },
    dimensions: { type: String },
    weight: { type: Number, min: 0 },
    customizable: { type: Boolean, default: false },
    isShown: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema, "items");
