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
    key: "contactPerson_required",
    translations: {
      ge: "საკონტაქტო პირი სავალდებულოა",
      en: "Contact person is required",
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
  {
    namespace: "validation",
    key: "name_description_required",
    translations: {
      ge: "სახელი და აღწერა სავალდებულოა",
      en: "Name and description are required",
    },
  },
  {
    namespace: "validation",
    key: "label_ka_required",
    translations: {
      ge: "ქართული სახელი სავალდებულოა",
      en: "Georgian label is required",
    },
  },
  {
    namespace: "validation",
    key: "label_ka_min_length",
    translations: {
      ge: "ქართული სახელი მინიმუმ 2 სიმბოლო უნდა იყოს",
      en: "Georgian label must be at least 2 characters",
    },
  },
  {
    namespace: "validation",
    key: "label_en_required",
    translations: {
      ge: "ინგლისური სახელი სავალდებულოა",
      en: "English label is required",
    },
  },
  {
    namespace: "validation",
    key: "label_en_invalid",
    translations: {
      ge: "ინგლისური სახელი მხოლოდ ლათინური ასოებით უნდა იყოს",
      en: "English label must only contain Latin characters",
    },
  },
  {
    namespace: "validation",
    key: "href_required",
    translations: { ge: "ლინკი სავალდებულოა", en: "Link is required" },
  },
  {
    namespace: "validation",
    key: "href_invalid",
    translations: {
      ge: "ლინკი უნდა იწყებოდეს '/' სიმბოლოთი",
      en: "Link must start with '/'",
    },
  },
  {
    namespace: "validation",
    key: "order_required",
    translations: { ge: "რიგითობა სავალდებულოა", en: "Order is required" },
  },
  {
    namespace: "validation",
    key: "order_invalid",
    translations: {
      ge: "რიგითობა უნდა იყოს 0 ან მეტი",
      en: "Order must be 0 or more",
    },
  },
  {
    namespace: "validation",
    key: "at_least_one_translation_required",
    translations: {
      ge: "ერთი თარგმანი მაინც სავალდებულოა",
      en: "At least one translation is required",
    },
  },
  {
    namespace: "validation",
    key: "email_taken",
    translations: {
      ge: "ეს ელ. ფოსტა უკვე გამოყენებულია",
      en: "Email already taken",
    },
  },
  {
    namespace: "validation",
    key: "id_code_taken",
    translations: {
      ge: "ეს საიდენტიფიკაციო კოდი უკვე გამოყენებულია",
      en: "ID code already taken",
    },
  },
  {
    namespace: "validation",
    key: "companyNameEn_invalid",
    translations: {
      ge: "კომპანიის სახელი მხოლოდ ლათინურ სიმბოლოებს უნდა შეიცავდეს",
      en: "Company name must contain only Latin characters",
    },
  },
  {
    namespace: "validation",
    key: "contactPerson_min_length",
    translations: {
      ge: "საკონტაქტო პირი მინიმუმ 2 სიმბოლო უნდა იყოს",
      en: "Contact person must be at least 2 characters",
    },
  },
  {
    namespace: "validation",
    key: "description_max_length",
    translations: {
      ge: "აღწერა არ უნდა აღემატებოდეს 500 სიმბოლოს",
      en: "Description must not exceed 500 characters",
    },
  },
  {
    namespace: "validation",
    key: "namespace_required",
    translations: {
      ge: "ნეიმსპეისი სავალდებულოა",
      en: "Namespace is required",
    },
  },
  {
    namespace: "validation",
    key: "key_required",
    translations: { ge: "გასაღები სავალდებულოა", en: "Key is required" },
  },
  {
    namespace: "validation",
    key: "ge_translation_required",
    translations: {
      ge: "ქართული თარგმანი სავალდებულოა",
      en: "Georgian translation is required",
    },
  },
  {
    namespace: "validation",
    key: "en_translation_required",
    translations: {
      ge: "ინგლისური თარგმანი სავალდებულოა",
      en: "English translation is required",
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
  {
    namespace: "auth",
    key: "token_not_found",
    translations: { ge: "ტოკენი ვერ მოიძებნა", en: "Token not found" },
  },
  {
    namespace: "auth",
    key: "already_verified",
    translations: {
      ge: "მეილი უკვე დადასტურებულია",
      en: "Email already verified",
    },
  },
  {
    namespace: "auth",
    key: "email_verified_success",
    translations: {
      ge: "მეილი წარმატებით დადასტურდა",
      en: "Email verified successfully",
    },
  },
  {
    namespace: "auth",
    key: "verification_link_expired",
    translations: {
      ge: "ვერიფიკაციის ლინკს ვადა გაუვიდა",
      en: "Verification link expired",
    },
  },
  {
    namespace: "auth",
    key: "link_invalid",
    translations: { ge: "ბმული არასწორია", en: "Link is invalid" },
  },
  {
    namespace: "auth",
    key: "partner_registered",
    translations: {
      ge: "ორგანიზაცია წარმატებით დარეგისტრირდა. ადმინისტრატორი განიხილავს თქვენს განაცხადს",
      en: "Organization registered successfully. Administrator will review your application",
    },
  },

  // ── Alerts & Feedbacks ─────────────────────────────────────────────────────
  {
    namespace: "alerts",
    key: "success_save",
    translations: { ge: "წარმატებით შეინახა", en: "Successfully saved" },
  },
  {
    namespace: "alerts",
    key: "permission_not_found",
    translations: { ge: "უფლება ვერ მოიძებნა", en: "Permission not found" },
  },
  {
    namespace: "alerts",
    key: "permission_created_success",
    translations: {
      ge: "უფლება წარმატებით შეიქმნა",
      en: "Permission created successfully",
    },
  },
  {
    namespace: "alerts",
    key: "permission_updated_success",
    translations: {
      ge: "უფლება წარმატებით განახლდა",
      en: "Permission updated successfully",
    },
  },
  {
    namespace: "alerts",
    key: "permission_deleted_success",
    translations: {
      ge: "უფლება წარმატებით წაიშალა",
      en: "Permission deleted successfully",
    },
  },
  {
    namespace: "alerts",
    key: "permission_already_exists",
    translations: {
      ge: "უფლება ამ სახელით უკვე არსებობს",
      en: "Permission with this name already exists",
    },
  },
  {
    namespace: "alerts",
    key: "menu_item_not_found",
    translations: {
      ge: "მენიუს ელემენტი ვერ მოიძებნა",
      en: "Menu item not found",
    },
  },
  {
    namespace: "alerts",
    key: "menu_item_deleted_success",
    translations: {
      ge: "მენიუს ელემენტი წარმატებით წაიშალა",
      en: "Menu item deleted successfully",
    },
  },
  {
    namespace: "alerts",
    key: "server_error",
    translations: { ge: "სერვერის შეცდომა", en: "Server error" },
  },
  {
    namespace: "alerts",
    key: "org_email_exists",
    translations: {
      ge: "ამ ელ. ფოსტით ორგანიზაცია უკვე არსებობს",
      en: "Organization with this email already exists",
    },
  },
  {
    namespace: "alerts",
    key: "org_code_exists",
    translations: {
      ge: "ამ საიდენტიფიკაციო კოდით ორგანიზაცია უკვე არსებობს",
      en: "Organization with this ID code already exists",
    },
  },
  {
    namespace: "alerts",
    key: "namespace_not_found",
    translations: { ge: "ნეიმსპეისი ვერ მოიძებნა", en: "Namespace not found" },
  },
  {
    namespace: "alerts",
    key: "translation_key_exists",
    translations: {
      ge: "თარგმანის ქეი ამ ნეიმსპეისში უკვე არსებობს",
      en: "Translation key already exists in this namespace",
    },
  },
  {
    namespace: "alerts",
    key: "translation_not_found",
    translations: { ge: "თარგმანი ვერ მოიძებნა", en: "Translation not found" },
  },
  {
    namespace: "alerts",
    key: "translation_updated_success",
    translations: {
      ge: "თარგმანი წარმატებით განახლდა",
      en: "Translation updated successfully",
    },
  },
  {
    namespace: "alerts",
    key: "translation_deleted_success",
    translations: {
      ge: "თარგმანი წარმატებით წაიშალა",
      en: "Translation deleted successfully",
    },
  },
  {
    namespace: "alerts",
    key: "invalid_payload_items_array",
    translations: {
      ge: "არასწორი მონაცემები: items უნდა იყოს მასივი",
      en: "Invalid payload: items must be an array",
    },
  },
  {
    namespace: "alerts",
    key: "no_items_to_import",
    translations: {
      ge: "იმპორტისთვის მონაცემები არ არის",
      en: "No items to import",
    },
  },
  {
    namespace: "alerts",
    key: "import_failed_namespaces_not_found",
    translations: {
      ge: "იმპორტი ჩაიშალა: ნეიმსპეისები არ მოიძებნა",
      en: "Import failed: Namespaces not found",
    },
  },
  {
    namespace: "alerts",
    key: "translations_bulk_import_success",
    translations: {
      ge: "თარგმანების იმპორტი წარმატებით დასრულდა",
      en: "Translations imported successfully",
    },
  },
  {
    namespace: "alerts",
    key: "no_items_to_delete",
    translations: {
      ge: "წასაშლელი მონაცემები არ არის",
      en: "No items to delete",
    },
  },
  {
    namespace: "alerts",
    key: "translations_bulk_delete_success",
    translations: {
      ge: "თარგმანები წარმატებით წაიშალა",
      en: "Translations deleted successfully",
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
