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
  { _id: "validation", name: "Validation" },
  { _id: "auth", name: "Auth" },
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
  // ── Validation Errors ──────────────────────────────────────────────────────
  {
    namespace: "validation",
    key: "email_required",
    translations: { ge: "ელ. ფოსტა სავალდებულოა", en: "Email is required" },
  },
  {
    namespace: "validation",
    key: "email_invalid",
    translations: {
      ge: "ელ. ფოსტის ფორმატი არასწორია",
      en: "Invalid email format",
    },
  },
  {
    namespace: "validation",
    key: "phone_required",
    translations: {
      ge: "ტელეფონის ნომერი სავალდებულოა",
      en: "Phone number is required",
    },
  },
  {
    namespace: "validation",
    key: "phone_invalid",
    translations: {
      ge: "ტელეფონის ნომერი უნდა იყოს ფორმატში: 5XX XXX XXX",
      en: "Phone number format: 5XX XXX XXX",
    },
  },
  {
    namespace: "validation",
    key: "city_required",
    translations: { ge: "ქალაქი სავალდებულოა", en: "City is required" },
  },
  {
    namespace: "validation",
    key: "city_invalid",
    translations: { ge: "ქალაქი არასწორია", en: "Invalid city" },
  },
  {
    namespace: "validation",
    key: "password_required",
    translations: { ge: "პაროლი სავალდებულოა", en: "Password is required" },
  },
  {
    namespace: "validation",
    key: "password_min_length",
    translations: {
      ge: "პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს",
      en: "Password must be at least 8 characters",
    },
  },
  {
    namespace: "validation",
    key: "companyNameGe_required",
    translations: {
      ge: "კომპანიის ქართული სახელი სავალდებულოა",
      en: "Company Georgian name is required",
    },
  },
  {
    namespace: "validation",
    key: "companyNameEn_required",
    translations: {
      ge: "კომპანიის ინგლისური სახელი სავალდებულოა",
      en: "Company English name is required",
    },
  },
  {
    namespace: "validation",
    key: "id_code_required",
    translations: {
      ge: "საიდენტიფიკაციო კოდი სავალდებულოა",
      en: "Identification code is required",
    },
  },
  {
    namespace: "validation",
    key: "id_code_invalid",
    translations: {
      ge: "საიდენტიფიკაციო კოდი უნდა შეიცავდეს 9 ციფრს",
      en: "Identification code must be 9 digits",
    },
  },
  {
    namespace: "validation",
    key: "address_required",
    translations: { ge: "მისამართი სავალდებულოა", en: "Address is required" },
  },
  {
    namespace: "validation",
    key: "address_needs_georgian",
    translations: {
      ge: "მისამართი უნდა იყოს ქართულად",
      en: "Address must be in Georgian",
    },
  },
  {
    namespace: "validation",
    key: "addressEn_required",
    translations: {
      ge: "მისამართი (ინგლისურად) სავალდებულოა",
      en: "Address (English) is required",
    },
  },
  {
    namespace: "validation",
    key: "addressEn_needs_english",
    translations: {
      ge: "მისამართი (ინგლისურად) უნდა იყოს ინგლისურად",
      en: "Address (English) must be in English",
    },
  },
  {
    namespace: "validation",
    key: "terms_required",
    translations: {
      ge: "წესებზე და პირობებზე დათანხმება აუცილებელია",
      en: "Terms and conditions agreement is required",
    },
  },
  // ── Auth Responses ─────────────────────────────────────────────────────────
  {
    namespace: "auth",
    key: "forgot_password_success",
    translations: {
      ge: "პაროლის აღდგენის ინსტრუქცია გაიგზავნა მეილზე",
      en: "Password reset instructions sent to email",
    },
  },
  {
    namespace: "auth",
    key: "token_required",
    translations: { ge: "ტოკენი სავალდებულოა", en: "Token is required" },
  },
  {
    namespace: "auth",
    key: "token_invalid",
    translations: {
      ge: "ტოკენი არასწორია ან ვადაგასული",
      en: "Token is invalid or expired",
    },
  },
  {
    namespace: "auth",
    key: "user_not_found",
    translations: { ge: "მომხმარებელი ვერ მოიძებნა", en: "User not found" },
  },
  {
    namespace: "auth",
    key: "password_reset_success",
    translations: {
      ge: "პაროლი წარმატებით შეიცვალა",
      en: "Password reset successfully",
    },
  },
  {
    namespace: "auth",
    key: "email_not_verified",
    translations: {
      ge: "ელ. ფოსტა არ არის დადასტურებული",
      en: "Email is not verified",
    },
  },
  {
    namespace: "auth",
    key: "invalid_email_password",
    translations: {
      ge: "ელ. ფოსტა ან პაროლი არასწორია",
      en: "Invalid email or password",
    },
  },
  {
    namespace: "auth",
    key: "login_success",
    translations: { ge: "წარმატებით შეხვედით", en: "Login successful" },
  },
  {
    namespace: "auth",
    key: "verification_email_resent",
    translations: {
      ge: "ვერიფიკაციის ლინკი ხელახლა გაიგზავნა მეილზე",
      en: "Verification email resent",
    },
  },
  {
    namespace: "auth",
    key: "email_already_exists",
    translations: {
      ge: "ეს ელ. ფოსტა უკვე გამოყენებულია",
      en: "Email already exists",
    },
  },
  {
    namespace: "auth",
    key: "id_number_already_exists",
    translations: {
      ge: "ეს საიდენტიფიკაციო ნომერი უკვე გამოყენებულია",
      en: "ID number already exists",
    },
  },
  {
    namespace: "auth",
    key: "register_success_verify_email",
    translations: {
      ge: "რეგისტრაცია წარმატებულია. გთხოვთ დაადასტუროთ მეილი",
      en: "Registration successful. Please verify your email",
    },
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
        console.log(
          `Translation key '${trans.key}' added to namespace '${trans.namespace}'.`,
        );
      } else {
        console.log(
          `Translation key '${trans.key}' already exists in namespace '${trans.namespace}'.`,
        );
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
