import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { resolve } from "path";

// Load .env relative to this file's execution path
dotenv.config();

// Attempt to connect to DB via .env DB_URI
const connectDB = async () => {
  try {
    const uri = process.env.DB_URI || process.env.MONGO_URI;
    if (!uri) throw new Error("No DB_URI found for seeder");
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for translation seeding");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};

const seedTranslations = async () => {
  await connectDB();
  
  // Since we don't have direct access to the compiled translation.modules outside of ts-node cleanly,
  // we'll use dynamic import or raw mongoose schemas
  const NamespaceSchema = new mongoose.Schema({ _id: String, name: String });
  const TranslationSchema = new mongoose.Schema({
    namespace: { type: String, ref: "Namespace" },
    key: String,
    translations: { ge: String, en: String }
  });
  
  const Namespace = mongoose.models.Namespace || mongoose.model("Namespace", NamespaceSchema);
  const Translation = mongoose.models.Translation || mongoose.model("Translation", TranslationSchema);

  // Ensure necessary namespaces exist
  const namespaces = [
    { _id: "inputs", name: "Form Inputs" },
    { _id: "pages", name: "Pages" },
    { _id: "validation", name: "Validation Errors" },
    { _id: "alerts", name: "Alerts" }
  ];

  for (const ns of namespaces) {
    await Namespace.updateOne({ _id: ns._id }, { $set: ns }, { upsert: true });
  }

  // Define Translations for Add Item
  const translationsToAdd = [
    // Inputs
    { ns: "inputs", key: "title_ge", ge: "სათაური (ქართულად)", en: "Title (Georgian)" },
    { ns: "inputs", key: "title_en", ge: "სათაური (ინგლისურად)", en: "Title (English)" },
    { ns: "inputs", key: "description_ge", ge: "აღწერა (ქართულად)", en: "Description (Georgian)" },
    { ns: "inputs", key: "description_en", ge: "აღწერა (ინგლისურად)", en: "Description (English)" },
    { ns: "inputs", key: "category", ge: "კატეგორია", en: "Category" },
    { ns: "inputs", key: "price", ge: "ფასი", en: "Price" },
    { ns: "inputs", key: "currency", ge: "ვალუტა", en: "Currency" },
    { ns: "inputs", key: "is_negotiable", ge: "ფასი შეთანხმებით", en: "Price is Negotiable" },
    { ns: "inputs", key: "stock_quantity", ge: "მარაგში არსებული რაოდენობა", en: "Stock Quantity" },
    { ns: "inputs", key: "is_one_of_a_kind", ge: "უნიკალური ეგზემპლარი", en: "One of a Kind" },
    { ns: "inputs", key: "shipping_available", ge: "მიწოდება შესაძლებელია", en: "Shipping Available" },
    { ns: "inputs", key: "shipping_price", ge: "მიწოდების ფასი", en: "Shipping Price" },
    { ns: "inputs", key: "location_ge", ge: "მდებარეობა (ქართულად)", en: "Location (Georgian)" },
    { ns: "inputs", key: "location_en", ge: "მდებარეობა (ინგლისურად)", en: "Location (English)" },
    { ns: "inputs", key: "condition", ge: "მდგომარეობა", en: "Condition" },
    { ns: "inputs", key: "condition_new", ge: "ახალი", en: "New" },
    { ns: "inputs", key: "condition_handmade", ge: "ხელნაკეთი", en: "Handmade" },
    { ns: "inputs", key: "condition_vintage", ge: "ვინტაჟი", en: "Vintage" },
    { ns: "inputs", key: "materials_ge", ge: "მასალები (ქართულად)", en: "Materials (Georgian)" },
    { ns: "inputs", key: "materials_en", ge: "მასალები (ინგლისურად)", en: "Materials (English)" },
    { ns: "inputs", key: "dimensions", ge: "ზომები", en: "Dimensions" },
    { ns: "inputs", key: "weight", ge: "წონა", en: "Weight" },
    { ns: "inputs", key: "customizable", ge: "შესაძლებელია პერსონალიზაცია", en: "Customizable" },
    { ns: "inputs", key: "images", ge: "სურათები", en: "Images" },
    { ns: "inputs", key: "video", ge: "ვიდეო", en: "Video" },
    { ns: "inputs", key: "add_item_btn", ge: "ნივთის დამატება", en: "Add Item" },

    // Pages
    { ns: "pages", key: "add_item_title", ge: "ახალი ნივთის დამატება", en: "Add a New Item" },
    { ns: "pages", key: "add_item_desc", ge: "შეავსეთ დეტალები მსოფლიოსთვის გასაზიარებლად", en: "Fill out the details to share with the world." },
    
    // Validation
    { ns: "validation", key: "titleGe_required", ge: "ქართული სათაური სავალდებულოა", en: "Georgian title is required" },
    { ns: "validation", key: "descriptionGe_required", ge: "ქართული აღწერა სავალდებულოა", en: "Georgian description is required" },
    { ns: "validation", key: "invalid_category", ge: "აირჩიეთ სწორი კატეგორია", en: "Select a valid category" },
    { ns: "validation", key: "invalid_price", ge: "ფასი უნდა იყოს სწორი ციფრი", en: "Price must be a valid number" },
    { ns: "validation", key: "invalid_stock", ge: "მარაგი უნდა იყოს სწორი ციფრი", en: "Stock must be a valid number" },
    { ns: "validation", key: "locationGe_required", ge: "ქართული მდებარეობა სავალდებულოა", en: "Georgian location is required" },
    { ns: "validation", key: "invalid_condition", ge: "აირჩიეთ სწორი მდგომარეობა", en: "Select a valid condition" },
    { ns: "validation", key: "images_required", ge: "აუცილებელია მინიმუმ 1 სურათის ატვირთვა", en: "At least 1 image is required" },
    { ns: "validation", key: "images_max", ge: "მაქსიმუმ 5 სურათია ნებადართული", en: "Maximum 5 images allowed" },

    // Strict Text Validations
    { ns: "validation", key: "titleGe_min", ge: "სათაური უნდა იყოს მინიმუმ 3 სიმბოლო", en: "Title must be at least 3 characters" },
    { ns: "validation", key: "titleGe_max", ge: "სათაური არ უნდა აღემატებოდეს 100 სიმბოლოს", en: "Title must not exceed 100 characters" },
    { ns: "validation", key: "titleGe_georgian", ge: "სათაური უნდა შეიცავდეს მხოლოდ ქართულ ასოებს", en: "Title must contain only Georgian characters" },
    { ns: "validation", key: "titleEn_required", ge: "ინგლისური სათაური სავალდებულოა", en: "English title is required" },
    
    { ns: "validation", key: "titleEn_min", ge: "Title must be at least 3 characters", en: "Title must be at least 3 characters" },
    { ns: "validation", key: "titleEn_max", ge: "Title must not exceed 100 characters", en: "Title must not exceed 100 characters" },
    { ns: "validation", key: "titleEn_english", ge: "Title must contain only English characters", en: "Title must contain only English characters" },

    { ns: "validation", key: "descriptionGe_min", ge: "აღწერა უნდა იყოს მინიმუმ 10 სიმბოლო", en: "Description must be at least 10 characters" },
    { ns: "validation", key: "descriptionGe_max", ge: "აღწერა არ უნდა აღემატებოდეს 2000 სიმბოლოს", en: "Description must not exceed 2000 characters" },
    { ns: "validation", key: "descriptionGe_georgian", ge: "აღწერა უნდა შეიცავდეს მხოლოდ ქართულ ასოებს", en: "Description must contain only Georgian characters" },

    { ns: "validation", key: "descriptionEn_required", ge: "ინგლისური აღწერა სავალდებულოა", en: "English description is required" },
    { ns: "validation", key: "descriptionEn_min", ge: "Description must be at least 10 characters", en: "Description must be at least 10 characters" },
    { ns: "validation", key: "descriptionEn_max", ge: "Description must not exceed 2000 characters", en: "Description must not exceed 2000 characters" },
    { ns: "validation", key: "descriptionEn_english", ge: "Description must contain only English characters", en: "Description must contain only English characters" },

    { ns: "validation", key: "tags_min_count", ge: "მინიმუმ 1 ტეგი სავალდებულოა", en: "At least 1 tag is required" },
    { ns: "validation", key: "materials_min_count", ge: "მინიმუმ 1 მასალა სავალდებულოა", en: "At least 1 material is required" },


    { ns: "validation", key: "locationGe_min", ge: "მდებარეობა უნდა იყოს მინიმუმ 2 სიმბოლო", en: "Location must be at least 2 characters" },
    { ns: "validation", key: "locationGe_max", ge: "მდებარეობა არ უნდა აღემატებოდეს 100 სიმბოლოს", en: "Location must not exceed 100 characters" },
    { ns: "validation", key: "locationGe_georgian", ge: "მდებარეობა უნდა შეიცავდეს მხოლოდ ქართულ ასოებს", en: "Location must contain only Georgian characters" },

    { ns: "validation", key: "locationEn_min", ge: "Location must be at least 2 characters", en: "Location must be at least 2 characters" },
    { ns: "validation", key: "locationEn_max", ge: "Location must not exceed 100 characters", en: "Location must not exceed 100 characters" },
    { ns: "validation", key: "locationEn_english", ge: "Location must contain only English characters", en: "Location must contain only English characters" },

    { ns: "validation", key: "invalid_shipping_price", ge: "მიწოდების ფასი უნდა იყოს 0 ან მეტი", en: "Shipping price must be 0 or more" },
    { ns: "validation", key: "invalid_weight", ge: "წონა უნდა იყოს 0-ზე მეტი", en: "Weight must be greater than 0" },

    // Tags & Materials
    { ns: "validation", key: "tags_max_count", ge: "მაქსიმუმ 10 ტეგია ნებადართული", en: "Maximum 10 tags allowed" },
    { ns: "validation", key: "tagsGe_alphabet", ge: "ქართული ტეგები უნდა შეიცავდეს მხოლოდ ქართულ ასოებს", en: "Georgian tags must contain only Georgian characters" },
    { ns: "validation", key: "tagsEn_alphabet", ge: "ინგლისური ტეგები უნდა შეიცავდეს მხოლოდ ინგლისურ ასოებს", en: "English tags must contain only English characters" },
    { ns: "validation", key: "tags_item_min", ge: "ტეგი უნდა იყოს მინიმუმ 3 სიმბოლო", en: "Tag must be at least 3 characters" },
    { ns: "validation", key: "tags_item_max", ge: "ტეგი არ უნდა აღემატებოდეს 30 სიმბოლოს", en: "Tag must not exceed 30 characters" },

    { ns: "validation", key: "materials_max_count", ge: "მაქსიმუმ 10 მასალაა ნებადართული", en: "Maximum 10 materials allowed" },
    { ns: "validation", key: "materialsGe_alphabet", ge: "ქართული მასალები უნდა შეიცავდეს მხოლოდ ქართულ ასოებს", en: "Georgian materials must contain only Georgian characters" },
    { ns: "validation", key: "materialsEn_alphabet", ge: "ინგლისური მასალები უნდა შეიცავდეს მხოლოდ ინგლისურ ასოებს", en: "English materials must contain only English characters" },
    { ns: "validation", key: "materials_item_min", ge: "მასალა უნდა იყოს მინიმუმ 3 სიმბოლო", en: "Material must be at least 3 characters" },
    { ns: "validation", key: "materials_item_max", ge: "მასალა არ უნდა აღემატებოდეს 30 სიმბოლოს", en: "Material must not exceed 30 characters" },

    // Alerts
    { ns: "alerts", key: "item_added_successfully", ge: "ნივთი წარმატებით დაემატა", en: "Item added successfully" }
  ];

  for (const trans of translationsToAdd) {
    await Translation.updateOne(
      { namespace: trans.ns, key: trans.key },
      { $set: { translations: { ge: trans.ge, en: trans.en } } },
      { upsert: true }
    );
  }

  console.log("Translations seeded successfully!");
  process.exit(0);
};

seedTranslations();
