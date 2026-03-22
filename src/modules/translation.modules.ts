import mongoose from "mongoose";

// 1. Namespace Schema
const NamespaceSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // e.g., 'alerts', 'inputs'
    name: { type: String, required: true }, // display name
  },
  { timestamps: true }
);

export const Namespace = mongoose.model("Namespace", NamespaceSchema);

// 2. Translation Schema
const TranslationSchema = new mongoose.Schema(
  {
    namespace: { 
      type: String, 
      ref: "Namespace", 
      required: true 
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    translations: {
      ge: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of key within a namespace
TranslationSchema.index({ namespace: 1, key: 1 }, { unique: true });

const Translation = mongoose.model("Translation", TranslationSchema);
export default Translation;

