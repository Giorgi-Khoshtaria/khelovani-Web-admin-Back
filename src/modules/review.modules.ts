import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  partner: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isVisible: boolean;
  hiddenBy: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    partner: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "rating_invalid",
      },
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 600,
    },
    // Admins hide instead of deleting; hidden reviews never reach the public
    // list and are excluded from the partner's average.
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
    hiddenBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true },
);

// One review per user per partner — re-submitting edits the existing one.
ReviewSchema.index({ user: 1, partner: 1 }, { unique: true });
ReviewSchema.index({ partner: 1, isVisible: 1, createdAt: -1 });
ReviewSchema.index({ createdAt: -1 });

export default mongoose.model<IReview>("Review", ReviewSchema);
