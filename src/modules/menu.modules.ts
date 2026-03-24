import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    label: {
      ka: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    href: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
export default MenuItem;
