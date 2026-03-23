import mongoose from "mongoose";
import dotenv from "dotenv";
import { Namespace } from "../../modules/translation.modules.js";
import Translation from "../../modules/translation.modules.js";
dotenv.config();

const namespacesToSeed = [
  { _id: "alerts", name: "Alerts" },
  { _id: "inputs", name: "Inputs" },
  { _id: "navigation", name: "Navigation" },
  { _id: "pages", name: "Pages" },
  { _id: "common", name: "Common" },
];

const translationsToSeed = [
  {
    namespace: "common",
    key: "save",
    translations: { ge: "შენახვა", en: "Save" },
  },
  {
    namespace: "common",
    key: "cancel",
    translations: { ge: "გაუქმება", en: "Cancel" },
  },
  {
    namespace: "alerts",
    key: "success_save",
    translations: { ge: "წარმატებით შეინახა", en: "Successfully saved" },
  },
  {
    namespace: "navigation",
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
