import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentCard extends Document {
  user: mongoose.Types.ObjectId;
  holderName: string;
  brand: "visa" | "mastercard" | "amex" | "other";
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentCardSchema = new Schema<IPaymentCard>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    holderName: { type: String, required: true, trim: true, uppercase: true },
    brand: {
      type: String,
      enum: ["visa", "mastercard", "amex", "other"],
      required: true,
    },
    last4: {
      type: String,
      required: true,
      match: /^\d{4}$/,
    },
    expMonth: { type: Number, required: true, min: 1, max: 12 },
    expYear: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

PaymentCardSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IPaymentCard>("PaymentCard", PaymentCardSchema);
