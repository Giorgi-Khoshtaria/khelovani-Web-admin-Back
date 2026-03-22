import mongoose from "mongoose";
import dotenv from "dotenv";
import { Namespace } from "../../modules/translation.modules.js";
import Translation from "../../modules/translation.modules.js";
import { TranslationNamespace } from "../../utils/types/translation.enum.js";

dotenv.config();

const namespacesToSeed = [
  { _id: TranslationNamespace.Alerts, name: "Alerts" },
  { _id: TranslationNamespace.Inputs, name: "Inputs" },
  { _id: TranslationNamespace.Navigation, name: "Navigation" },
  { _id: TranslationNamespace.Pages, name: "Pages" },
  { _id: TranslationNamespace.Common, name: "Common" },
];

const translationsToSeed = [
  {
    namespace: TranslationNamespace.Common,
    key: "save",
    translations: { ge: "შენახვა", en: "Save" },
  },
  {
    namespace: TranslationNamespace.Common,
    key: "cancel",
    translations: { ge: "გაუქმება", en: "Cancel" },
  },
  {
    namespace: TranslationNamespace.Alerts,
    key: "success_save",
    translations: { ge: "წარმატებით შეინახა", en: "Successfully saved" },
  },
  {
    namespace: TranslationNamespace.Navigation,
    key: "home",
    translations: { ge: "მთავარი", en: "Home" },
  },
];

const seedTranslation = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for translation seeding");

    // 1. Seed Namespaces
    for (const ns of namespacesToSeed) {
      const existingNamespace = await Namespace.findById(ns._id);
      if (!existingNamespace) {
        await Namespace.create(ns);
        console.log(`Namespace '${ns._id}' created successfully.`);
      } else {
        console.log(`Namespace '${ns._id}' already exists.`);
      }
    }

    // 2. Seed Translations
    for (const trans of translationsToSeed) {
      const existingTranslation = await Translation.findOne({
        namespace: trans.namespace,
        key: trans.key,
      });

      if (!existingTranslation) {
        await Translation.create(trans);
        console.log(`Translation key '${trans.key}' added to namespace '${trans.namespace}'.`);
      } else {
        console.log(`Translation key '${trans.key}' already exists in namespace '${trans.namespace}'.`);
      }
    }

    console.log("Translation seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding translations: ", error);
    process.exit(1);
  }
};

seedTranslation();
