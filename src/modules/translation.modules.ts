import mongoose from "mongoose";

const TranslationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    translations: {
      ge: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        required: true,
        trim: true,
      },
    },
  },
  { timestamps: true },
);

const Translation = mongoose.model("Translation", TranslationSchema);
export default Translation;
