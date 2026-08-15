import mongoose from "mongoose";

const PageSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      ka: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    description: {
      ka: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    ogImage: {
      type: String,
      default: "",
    },
    noindex: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Page = mongoose.model("Page", PageSchema);
export default Page;
