import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  slug: string;
  nameGe: string;
  nameEn: string;
  isActive: boolean;
  isPinned: boolean;
  pinnedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 50,
    },
    nameGe: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    nameEn: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPinned: { type: Boolean, default: false, index: true },
    pinnedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model<ICategory>("Category", CategorySchema);
