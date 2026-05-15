import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  priceAtSave: number;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    priceAtSave: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

FavoriteSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model<IFavorite>("Favorite", FavoriteSchema);
