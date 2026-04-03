import mongoose from "mongoose";
import dotenv from "dotenv";
import { Namespace } from "../../modules/translation.modules.js";
import Translation from "../../modules/translation.modules.js";

dotenv.config();

const namespaces = [
  {
    _id: "alerts",
    name: "Alerts",
  },
  {
    _id: "inputs",
    name: "Inputs",
  },
  {
    _id: "navigation",
    name: "Navigation",
  },
  {
    _id: "pages",
    name: "Pages",
  },
  {
    _id: "common",
    name: "Common",
  },
  {
    _id: "validation",
    name: "Validation",
  },
  {
    _id: "auth",
    name: "Auth",
  },
];
const translations = [
  {
    namespace: "common",
    key: "save",
    translations: {
      ge: "შენახვა",
      en: "Save",
    },
  },
  {
    namespace: "common",
    key: "cancel",
    translations: {
      ge: "გაუქმება",
      en: "Cancel",
    },
  },
  {
    namespace: "alerts",
    key: "success_save",
    translations: {
      ge: "წარმატებით შეინახა",
      en: "Successfully saved",
    },
  },
  {
    namespace: "navigation",
    key: "home",
    translations: {
      ge: "მთავარი",
      en: "Home",
    },
  },
  {
    namespace: "validation",
    key: "email_required",
    translations: {
      ge: "ელ. ფოსტა სავალდებულოა",
      en: "Email is required",
    },
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
    translations: {
      ge: "ქალაქი სავალდებულოა",
      en: "City is required",
    },
  },
  {
    namespace: "validation",
    key: "city_invalid",
    translations: {
      ge: "ქალაქი არასწორია",
      en: "Invalid city",
    },
  },
  {
    namespace: "validation",
    key: "password_required",
    translations: {
      ge: "პაროლი სავალდებულოა",
      en: "Password is required",
    },
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
    translations: {
      ge: "მისამართი სავალდებულოა",
      en: "Address is required",
    },
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
    translations: {
      ge: "ლინკი სავალდებულოა",
      en: "Link is required",
    },
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
    translations: {
      ge: "რიგითობა სავალდებულოა",
      en: "Order is required",
    },
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
    translations: {
      ge: "გასაღები სავალდებულოა",
      en: "Key is required",
    },
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
    translations: {
      ge: "ტოკენი სავალდებულოა",
      en: "Token is required",
    },
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
    translations: {
      ge: "მომხმარებელი ვერ მოიძებნა",
      en: "User not found",
    },
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
    translations: {
      ge: "წარმატებით შეხვედით",
      en: "Login successful",
    },
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
    translations: {
      ge: "ტოკენი ვერ მოიძებნა",
      en: "Token not found",
    },
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
    translations: {
      ge: "ბმული არასწორია",
      en: "Link is invalid",
    },
  },
  {
    namespace: "auth",
    key: "partner_registered",
    translations: {
      ge: "ორგანიზაცია წარმატებით დარეგისტრირდა. ადმინისტრატორი განიხილავს თქვენს განაცხადს",
      en: "Organization registered successfully. Administrator will review your application",
    },
  },
  {
    namespace: "alerts",
    key: "permission_not_found",
    translations: {
      ge: "უფლება ვერ მოიძებნა",
      en: "Permission not found",
    },
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
    translations: {
      ge: "სერვერის შეცდომა. სცადეთ მოგვიანებით.",
      en: "Server error. Please try again later.",
    },
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
    translations: {
      ge: "ნეიმსპეისი ვერ მოიძებნა",
      en: "Namespace not found",
    },
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
    translations: {
      ge: "თარგმანი ვერ მოიძებნა",
      en: "Translation not found",
    },
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
  {
    namespace: "inputs",
    key: "title_ge",
    translations: {
      ge: "სათაური (ქართულად)",
      en: "Title (Georgian)",
    },
  },
  {
    namespace: "inputs",
    key: "title_en",
    translations: {
      ge: "სათაური (ინგლისურად)",
      en: "Title (English)",
    },
  },
  {
    namespace: "inputs",
    key: "description_ge",
    translations: {
      ge: "აღწერა (ქართულად)",
      en: "Description (Georgian)",
    },
  },
  {
    namespace: "inputs",
    key: "description_en",
    translations: {
      ge: "აღწერა (ინგლისურად)",
      en: "Description (English)",
    },
  },
  {
    namespace: "inputs",
    key: "category",
    translations: {
      ge: "კატეგორია",
      en: "Category",
    },
  },
  {
    namespace: "inputs",
    key: "price",
    translations: {
      ge: "ფასი",
      en: "Price",
    },
  },
  {
    namespace: "inputs",
    key: "currency",
    translations: {
      ge: "ვალუტა",
      en: "Currency",
    },
  },
  {
    namespace: "inputs",
    key: "is_negotiable",
    translations: {
      ge: "ფასი შეთანხმებით",
      en: "Price is Negotiable",
    },
  },
  {
    namespace: "inputs",
    key: "stock_quantity",
    translations: {
      ge: "მარაგში არსებული რაოდენობა",
      en: "Stock Quantity",
    },
  },
  {
    namespace: "inputs",
    key: "is_one_of_a_kind",
    translations: {
      ge: "უნიკალური ეგზემპლარი",
      en: "One of a Kind",
    },
  },
  {
    namespace: "inputs",
    key: "shipping_available",
    translations: {
      ge: "მიწოდება შესაძლებელია",
      en: "Shipping Available",
    },
  },
  {
    namespace: "inputs",
    key: "shipping_price",
    translations: {
      ge: "მიწოდების ფასი",
      en: "Shipping Price",
    },
  },
  {
    namespace: "inputs",
    key: "location_ge",
    translations: {
      ge: "მდებარეობა (ქართულად)",
      en: "Location (Georgian)",
    },
  },
  {
    namespace: "inputs",
    key: "location_en",
    translations: {
      ge: "მდებარეობა (ინგლისურად)",
      en: "Location (English)",
    },
  },
  {
    namespace: "inputs",
    key: "condition",
    translations: {
      ge: "მდგომარეობა",
      en: "Condition",
    },
  },
  {
    namespace: "inputs",
    key: "condition_new",
    translations: {
      ge: "ახალი",
      en: "New",
    },
  },
  {
    namespace: "inputs",
    key: "condition_handmade",
    translations: {
      ge: "ხელნაკეთი",
      en: "Handmade",
    },
  },
  {
    namespace: "inputs",
    key: "condition_vintage",
    translations: {
      ge: "ვინტაჟი",
      en: "Vintage",
    },
  },
  {
    namespace: "inputs",
    key: "materials_ge",
    translations: {
      ge: "მასალები (ქართულად)",
      en: "Materials (Georgian)",
    },
  },
  {
    namespace: "inputs",
    key: "materials_en",
    translations: {
      ge: "მასალები (ინგლისურად)",
      en: "Materials (English)",
    },
  },
  {
    namespace: "inputs",
    key: "dimensions",
    translations: {
      ge: "ზომები",
      en: "Dimensions",
    },
  },
  {
    namespace: "inputs",
    key: "weight",
    translations: {
      ge: "წონა",
      en: "Weight",
    },
  },
  {
    namespace: "inputs",
    key: "customizable",
    translations: {
      ge: "შესაძლებელია პერსონალიზაცია",
      en: "Customizable",
    },
  },
  {
    namespace: "inputs",
    key: "images",
    translations: {
      ge: "სურათები",
      en: "Images",
    },
  },
  {
    namespace: "inputs",
    key: "add_item_btn",
    translations: {
      ge: "ნივთის დამატება",
      en: "Add Item",
    },
  },
  {
    namespace: "pages",
    key: "add_item_title",
    translations: {
      ge: "ახალი ნივთის დამატება",
      en: "Add a New Item",
    },
  },
  {
    namespace: "pages",
    key: "add_item_desc",
    translations: {
      ge: "შეავსეთ დეტალები მსოფლიოსთვის გასაზიარებლად",
      en: "Fill out the details to share with the world.",
    },
  },
  {
    namespace: "validation",
    key: "titleGe_required",
    translations: {
      ge: "ქართული სათაური სავალდებულოა",
      en: "Georgian title is required",
    },
  },
  {
    namespace: "validation",
    key: "titleGe_min",
    translations: {
      ge: "სათაური უნდა იყოს მინიმუმ 3 სიმბოლო",
      en: "Title must be at least 3 characters",
    },
  },
  {
    namespace: "validation",
    key: "titleGe_max",
    translations: {
      ge: "სათაური არ უნდა აღემატებოდეს 100 სიმბოლოს",
      en: "Title must not exceed 100 characters",
    },
  },
  {
    namespace: "validation",
    key: "titleGe_georgian",
    translations: {
      ge: "სათაური უნდა შეიცავდეს მხოლოდ ქართულ ასოებს",
      en: "Title must contain only Georgian characters",
    },
  },
  {
    namespace: "validation",
    key: "titleEn_required",
    translations: {
      ge: "ინგლისური სათაური სავალდებულოა",
      en: "English title is required",
    },
  },
  {
    namespace: "validation",
    key: "titleEn_min",
    translations: {
      ge: "Title must be at least 3 characters",
      en: "Title must be at least 3 characters",
    },
  },
  {
    namespace: "validation",
    key: "titleEn_max",
    translations: {
      ge: "Title must not exceed 100 characters",
      en: "Title must not exceed 100 characters",
    },
  },
  {
    namespace: "validation",
    key: "titleEn_english",
    translations: {
      ge: "Title must contain only English characters",
      en: "Title must contain only English characters",
    },
  },
  {
    namespace: "validation",
    key: "descriptionGe_required",
    translations: {
      ge: "ქართული აღწერა სავალდებულოა",
      en: "Georgian description is required",
    },
  },
  {
    namespace: "validation",
    key: "descriptionGe_min",
    translations: {
      ge: "აღწერა უნდა იყოს მინიმუმ 10 სიმბოლო",
      en: "Description must be at least 10 characters",
    },
  },
  {
    namespace: "validation",
    key: "descriptionGe_max",
    translations: {
      ge: "აღწერა არ უნდა აღემატებოდეს 2000 სიმბოლოს",
      en: "Description must not exceed 2000 characters",
    },
  },
  {
    namespace: "validation",
    key: "descriptionGe_georgian",
    translations: {
      ge: "აღწერა უნდა შეიცავდეს მხოლოდ ქართულ ასოებს",
      en: "Description must contain only Georgian characters",
    },
  },
  {
    namespace: "validation",
    key: "descriptionEn_required",
    translations: {
      ge: "ინგლისური აღწერა სავალდებულოა",
      en: "English description is required",
    },
  },
  {
    namespace: "validation",
    key: "descriptionEn_min",
    translations: {
      ge: "Description must be at least 10 characters",
      en: "Description must be at least 10 characters",
    },
  },
  {
    namespace: "validation",
    key: "descriptionEn_max",
    translations: {
      ge: "Description must not exceed 2000 characters",
      en: "Description must not exceed 2000 characters",
    },
  },
  {
    namespace: "validation",
    key: "descriptionEn_english",
    translations: {
      ge: "Description must contain only English characters",
      en: "Description must contain only English characters",
    },
  },
  {
    namespace: "validation",
    key: "invalid_category",
    translations: {
      ge: "აირჩიეთ სწორი კატეგორია",
      en: "Select a valid category",
    },
  },
  {
    namespace: "validation",
    key: "invalid_price",
    translations: {
      ge: "ფასი უნდა იყოს სწორი ციფრი",
      en: "Price must be a valid number",
    },
  },
  {
    namespace: "validation",
    key: "invalid_stock",
    translations: {
      ge: "მარაგი უნდა იყოს სწორი ციფრი",
      en: "Stock must be a valid number",
    },
  },
  {
    namespace: "validation",
    key: "invalid_condition",
    translations: {
      ge: "აირჩიეთ სწორი მდგომარეობა",
      en: "Select a valid condition",
    },
  },
  {
    namespace: "validation",
    key: "invalid_shipping_price",
    translations: {
      ge: "მიწოდების ფასი უნდა იყოს 0 ან მეტი",
      en: "Shipping price must be 0 or more",
    },
  },
  {
    namespace: "validation",
    key: "invalid_weight",
    translations: {
      ge: "წონა უნდა იყოს 0-ზე მეტი",
      en: "Weight must be greater than 0",
    },
  },
  {
    namespace: "validation",
    key: "locationGe_required",
    translations: {
      ge: "ქართული მდებარეობა სავალდებულოა",
      en: "Georgian location is required",
    },
  },
  {
    namespace: "validation",
    key: "locationGe_min",
    translations: {
      ge: "მდებარეობა უნდა იყოს მინიმუმ 2 სიმბოლო",
      en: "Location must be at least 2 characters",
    },
  },
  {
    namespace: "validation",
    key: "locationGe_max",
    translations: {
      ge: "მდებარეობა არ უნდა აღემატებოდეს 100 სიმბოლოს",
      en: "Location must not exceed 100 characters",
    },
  },
  {
    namespace: "validation",
    key: "locationGe_georgian",
    translations: {
      ge: "მდებარეობა უნდა შეიცავდეს მხოლოდ ქართულ ასოებს",
      en: "Location must contain only Georgian characters",
    },
  },
  {
    namespace: "validation",
    key: "locationEn_min",
    translations: {
      ge: "Location must be at least 2 characters",
      en: "Location must be at least 2 characters",
    },
  },
  {
    namespace: "validation",
    key: "locationEn_max",
    translations: {
      ge: "Location must not exceed 100 characters",
      en: "Location must not exceed 100 characters",
    },
  },
  {
    namespace: "validation",
    key: "locationEn_english",
    translations: {
      ge: "Location must contain only English characters",
      en: "Location must contain only English characters",
    },
  },
  {
    namespace: "validation",
    key: "images_required",
    translations: {
      ge: "აუცილებელია მინიმუმ 1 სურათის ატვირთვა",
      en: "At least 1 image is required",
    },
  },
  {
    namespace: "validation",
    key: "images_max",
    translations: {
      ge: "მაქსიმუმ 5 სურათია ნებადართული",
      en: "Maximum 5 images allowed",
    },
  },
  {
    namespace: "validation",
    key: "tags_min_count",
    translations: {
      ge: "მინიმუმ 1 ტეგი სავალდებულოა",
      en: "At least 1 tag is required",
    },
  },
  {
    namespace: "validation",
    key: "tags_max_count",
    translations: {
      ge: "მაქსიმუმ 10 ტეგია ნებადართული",
      en: "Maximum 10 tags allowed",
    },
  },
  {
    namespace: "validation",
    key: "tags_item_min",
    translations: {
      ge: "ტეგი უნდა იყოს მინიმუმ 3 სიმბოლო",
      en: "Tag must be at least 3 characters",
    },
  },
  {
    namespace: "validation",
    key: "tags_item_max",
    translations: {
      ge: "ტეგი არ უნდა აღემატებოდეს 30 სიმბოლოს",
      en: "Tag must not exceed 30 characters",
    },
  },
  {
    namespace: "validation",
    key: "tagsGe_alphabet",
    translations: {
      ge: "ქართული ტეგები უნდა შეიცავდეს მხოლოდ ქართულ ასოებს",
      en: "Georgian tags must contain only Georgian characters",
    },
  },
  {
    namespace: "validation",
    key: "tagsEn_alphabet",
    translations: {
      ge: "ინგლისური ტეგები უნდა შეიცავდეს მხოლოდ ინგლისურ ასოებს",
      en: "English tags must contain only English characters",
    },
  },
  {
    namespace: "validation",
    key: "materials_min_count",
    translations: {
      ge: "მინიმუმ 1 მასალა სავალდებულოა",
      en: "At least 1 material is required",
    },
  },
  {
    namespace: "validation",
    key: "materials_max_count",
    translations: {
      ge: "მაქსიმუმ 10 მასალაა ნებადართული",
      en: "Maximum 10 materials allowed",
    },
  },
  {
    namespace: "validation",
    key: "materials_item_min",
    translations: {
      ge: "მასალა უნდა იყოს მინიმუმ 3 სიმბოლო",
      en: "Material must be at least 3 characters",
    },
  },
  {
    namespace: "validation",
    key: "materials_item_max",
    translations: {
      ge: "მასალა არ უნდა აღემატებოდეს 30 სიმბოლოს",
      en: "Material must not exceed 30 characters",
    },
  },
  {
    namespace: "validation",
    key: "materialsGe_alphabet",
    translations: {
      ge: "ქართული მასალები უნდა შეიცავდეს მხოლოდ ქართულ ასოებს",
      en: "Georgian materials must contain only Georgian characters",
    },
  },
  {
    namespace: "validation",
    key: "materialsEn_alphabet",
    translations: {
      ge: "ინგლისური მასალები უნდა შეიცავდეს მხოლოდ ინგლისურ ასოებს",
      en: "English materials must contain only English characters",
    },
  },
  {
    namespace: "alerts",
    key: "item_added_successfully",
    translations: {
      ge: "ნივთი წარმატებით დაემატა",
      en: "Item added successfully",
    },
  },
  {
    namespace: "alerts",
    key: "item_updated_successfully",
    translations: {
      ge: "ნივთი წარმატებით განახლდა",
      en: "Item updated successfully",
    },
  },
  {
    namespace: "alerts",
    key: "item_deleted_successfully",
    translations: {
      ge: "ნივთი წარმატებით წაიშალა",
      en: "Item deleted successfully",
    },
  },
  {
    namespace: "inputs",
    key: "add_product_btn",
    translations: {
      ge: "პროდუქტის დამატება",
      en: "Add Product",
    },
  },
  {
    namespace: "pages",
    key: "add_product_title",
    translations: {
      ge: "ახალი პროდუქტის დამატება",
      en: "Add a New Product",
    },
  },
  {
    namespace: "pages",
    key: "add_product_desc",
    translations: {
      ge: "შეავსეთ დეტალები მსოფლიოსთვის გასაზიარებლად",
      en: "Fill out the details to share with the world.",
    },
  },
  {
    namespace: "alerts",
    key: "product_added_successfully",
    translations: {
      ge: "პროდუქტი წარმატებით დაემატა",
      en: "Product added successfully",
    },
  },
  {
    namespace: "alerts",
    key: "product_updated_successfully",
    translations: {
      ge: "პროდუქტი წარმატებით განახლდა",
      en: "Product updated successfully",
    },
  },
  {
    namespace: "alerts",
    key: "product_deleted_successfully",
    translations: {
      ge: "პროდუქტი წარმატებით წაიშალა",
      en: "Product deleted successfully",
    },
  },
  {
    namespace: "alerts",
    key: "invalid_email_or_password",
    translations: {
      ge: "არასწორი მეილი ან პაროლი",
      en: "Invalid email or password",
    },
  },
  {
    namespace: "alerts",
    key: "org_not_active",
    translations: {
      ge: "ორგანიზაცია არ არის აქტიური",
      en: "Organization is not active",
    },
  },
  {
    namespace: "alerts",
    key: "org_not_verified",
    translations: {
      ge: "ორგანიზაცია ჯერ არ არის დადასტურებული",
      en: "Organization is not yet verified",
    },
  },
  {
    namespace: "alerts",
    key: "partner_registered",
    translations: {
      ge: "განაცხადი წარმატებით გაიგზავნა!",
      en: "Application sent successfully!",
    },
  },
  {
    namespace: "alerts",
    key: "partner_not_found",
    translations: {
      ge: "პარტნიორი ვერ მოიძებნა",
      en: "Partner not found",
    },
  },
  {
    namespace: "alerts",
    key: "invalid_partner_id",
    translations: {
      ge: "არასწორი პარტნიორის ID",
      en: "Invalid partner ID",
    },
  },
  {
    namespace: "alerts",
    key: "user_not_found",
    translations: {
      ge: "მომხმარებელი არ მოიძებნა",
      en: "User not found",
    },
  },
  {
    namespace: "alerts",
    key: "user_email_exists",
    translations: {
      ge: "ამ ელ. ფოსტით მომხმარებელი უკვე არსებობს",
      en: "User with this email already exists",
    },
  },
  {
    namespace: "alerts",
    key: "user_id_exists",
    translations: {
      ge: "ამ პირადი ნომრით მომხმარებელი უკვე არსებობს",
      en: "User with this ID number already exists",
    },
  },
  {
    namespace: "alerts",
    key: "user_registered",
    translations: {
      ge: "მომხმარებელი წარმატებით დარეგისტრირდა! გთხოვთ შეამოწმოთ ელ-ფოსტა დასადასტურებლად",
      en: "User registered! Please check your email to verify",
    },
  },
  {
    namespace: "alerts",
    key: "verify_email_first",
    translations: {
      ge: "გთხოვთ ჯერ დაადასტუროთ ელ-ფოსტა",
      en: "Please verify your email first",
    },
  },
  {
    namespace: "alerts",
    key: "verification_resent",
    translations: {
      ge: "ვერიფიკაციის ლინკი ხელახლა გაიგზავნა თქვენს ელ-ფოსტაზე",
      en: "Verification link resent to your email",
    },
  },
  {
    namespace: "alerts",
    key: "verification_link_expired",
    translations: {
      ge: "ვერიფიკაციის ლინკის ვადა გასულია. გთხოვთ ხელახლა დარეგისტრირდეთ.",
      en: "Verification link expired. Please register again.",
    },
  },
  {
    namespace: "alerts",
    key: "email_already_verified",
    translations: {
      ge: "შენი ელ-ფოსტა უკვე დადასტურებულია. შეგიძლია შეხვიდე სისტემაში.",
      en: "Your email is already verified. You can log in.",
    },
  },
  {
    namespace: "alerts",
    key: "email_verified",
    translations: {
      ge: "შენი ელ-ფოსტა წარმატებით დადასტურდა. ახლა შეგიძლია შეხვიდე სისტემაში.",
      en: "Your email has been verified. You can now log in.",
    },
  },
  {
    namespace: "alerts",
    key: "verification_failed",
    translations: {
      ge: "დადასტურება ვერ მოხერხდა",
      en: "Verification failed",
    },
  },
  {
    namespace: "alerts",
    key: "password_changed",
    translations: {
      ge: "პაროლი წარმატებით შეიცვალა",
      en: "Password changed successfully",
    },
  },
  {
    namespace: "alerts",
    key: "password_reset_sent",
    translations: {
      ge: "თუ ეს ელ-ფოსტა რეგისტრირებულია, პაროლის აღდგენის ლინკი გაიგზავნება",
      en: "If this email is registered, a password reset link will be sent",
    },
  },
  {
    namespace: "alerts",
    key: "token_required",
    translations: {
      ge: "ტოკენი სავალდებულოა",
      en: "Token is required",
    },
  },
  {
    namespace: "alerts",
    key: "token_not_found",
    translations: {
      ge: "ტოკენი არ მოიძებნა",
      en: "Token not found",
    },
  },
  {
    namespace: "alerts",
    key: "token_invalid_expired",
    translations: {
      ge: "ტოკენი არასწორია ან ვადა გასულია",
      en: "Token is invalid or expired",
    },
  },
  {
    namespace: "alerts",
    key: "auth_required",
    translations: {
      ge: "ავტორიზაცია საჭიროა",
      en: "Authorization required",
    },
  },
  {
    namespace: "alerts",
    key: "access_denied",
    translations: {
      ge: "წვდომა აკრძალულია",
      en: "Access denied",
    },
  },
  {
    namespace: "alerts",
    key: "login_success",
    translations: {
      ge: "წარმატებით შეხვედით სისტემაში",
      en: "Logged in successfully",
    },
  },
  {
    namespace: "alerts",
    key: "login_error",
    translations: {
      ge: "შესვლის დროს დაფიქსირდა შეცდომა",
      en: "An error occurred during login",
    },
  },
  {
    namespace: "alerts",
    key: "already_logged_in",
    translations: {
      ge: "თქვენ უკვე შესული ხართ სისტემაში",
      en: "You are already logged in",
    },
  },
  {
    namespace: "alerts",
    key: "account_created",
    translations: {
      ge: "ანგარიში წარმატებით შეიქმნა! გთხოვთ დაადასტუროთ თქვენი მეილი",
      en: "Account created! Please verify your email",
    },
  },
  {
    namespace: "alerts",
    key: "registration_error",
    translations: {
      ge: "რეგისტრაციის დროს დაფიქსირდა შეცდომა",
      en: "An error occurred during registration",
    },
  },
  {
    namespace: "alerts",
    key: "unexpected_error",
    translations: {
      ge: "მოხდა გაუთვალისწინებელი შეცდომა",
      en: "An unexpected error occurred",
    },
  },
  {
    namespace: "alerts",
    key: "server_connection_failed",
    translations: {
      ge: "სერვერთან დაკავშირება ვერ მოხერხდა",
      en: "Failed to connect to server",
    },
  },
  {
    namespace: "alerts",
    key: "request_failed",
    translations: {
      ge: "მოთხოვნის გაგზავნა ვერ მოხერხდა",
      en: "Failed to send request",
    },
  },
  {
    namespace: "alerts",
    key: "link_invalid",
    translations: {
      ge: "ლინკი არასწორია ან დაზიანებულია.",
      en: "Link is invalid or corrupted.",
    },
  },
  {
    namespace: "inputs",
    key: "label.email",
    translations: {
      ge: "ელ. ფოსტა",
      en: "Email",
    },
  },
  {
    namespace: "inputs",
    key: "label.password",
    translations: {
      ge: "პაროლი",
      en: "Password",
    },
  },
  {
    namespace: "inputs",
    key: "label.new_password",
    translations: {
      ge: "ახალი პაროლი",
      en: "New password",
    },
  },
  {
    namespace: "inputs",
    key: "label.confirm_password",
    translations: {
      ge: "გაიმეორე პაროლი",
      en: "Confirm password",
    },
  },
  {
    namespace: "inputs",
    key: "label.id_number",
    translations: {
      ge: "პირადი ნომერი",
      en: "ID number",
    },
  },
  {
    namespace: "inputs",
    key: "label.full_name_ge",
    translations: {
      ge: "სახელი და გვარი (ქართულად)",
      en: "Full name (Georgian)",
    },
  },
  {
    namespace: "inputs",
    key: "label.full_name_en",
    translations: {
      ge: "სახელი და გვარი (ლათინურად)",
      en: "Full name (Latin)",
    },
  },
  {
    namespace: "inputs",
    key: "label.phone",
    translations: {
      ge: "ტელეფონის ნომერი",
      en: "Phone number",
    },
  },
  {
    namespace: "inputs",
    key: "label.date_of_birth",
    translations: {
      ge: "დაბადების თარიღი",
      en: "Date of birth",
    },
  },
  {
    namespace: "inputs",
    key: "label.city",
    translations: {
      ge: "ქალაქი",
      en: "City",
    },
  },
  {
    namespace: "inputs",
    key: "label.address",
    translations: {
      ge: "მისამართი",
      en: "Address",
    },
  },
  {
    namespace: "inputs",
    key: "label.address_en",
    translations: {
      ge: "მისამართი (ინგლისურად)",
      en: "Address (English)",
    },
  },
  {
    namespace: "inputs",
    key: "label.company_name_ge",
    translations: {
      ge: "კომპანიის სახელი (ქართულად)",
      en: "Company name (Georgian)",
    },
  },
  {
    namespace: "inputs",
    key: "label.company_name_en",
    translations: {
      ge: "კომპანიის სახელი (ლათინურად)",
      en: "Company name (Latin)",
    },
  },
  {
    namespace: "inputs",
    key: "label.identification_code",
    translations: {
      ge: "საიდენტიფიკაციო კოდი",
      en: "Identification code",
    },
  },
  {
    namespace: "inputs",
    key: "label.contact_person",
    translations: {
      ge: "საკონტაქტო პირის სახელი",
      en: "Contact person",
    },
  },
  {
    namespace: "inputs",
    key: "label.description",
    translations: {
      ge: "კომპანიის მოკლე აღწერა",
      en: "Company description",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.email",
    translations: {
      ge: "მაგ: example@gmail.com",
      en: "e.g. example@gmail.com",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.password",
    translations: {
      ge: "შეიყვანე პაროლი",
      en: "Enter your password",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.new_password",
    translations: {
      ge: "მინ. 8 სიმბოლო",
      en: "Min. 8 characters",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.confirm_password",
    translations: {
      ge: "გაიმეორე ახალი პაროლი",
      en: "Repeat new password",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.id_number",
    translations: {
      ge: "11-ნიშნა პირადი ნომერი",
      en: "11-digit ID number",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.full_name",
    translations: {
      ge: "სახელი გვარი",
      en: "First Last name",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.phone",
    translations: {
      ge: "5XX XXX XXX",
      en: "5XX XXX XXX",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.city",
    translations: {
      ge: "აირჩიე ქალაქი",
      en: "Choose a city",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.address",
    translations: {
      ge: "ქუჩა, შენობა, ბინა",
      en: "Street, building, apartment",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.company_name",
    translations: {
      ge: "კომპანიის სახელი",
      en: "Company name",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.id_code",
    translations: {
      ge: "9-ნიშნა საიდენტიფიკაციო კოდი",
      en: "9-digit identification code",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.contact_person",
    translations: {
      ge: "სახელი გვარი",
      en: "First Last name",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.description",
    translations: {
      ge: "მაგ: ჩვენ ვართ ქართული ხელნაკეთი სამკაულების მწარმოებელი კომპანია...",
      en: "e.g. We are a Georgian handmade jewelry company...",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.search",
    translations: {
      ge: "ძებნა...",
      en: "Search...",
    },
  },
  {
    namespace: "inputs",
    key: "placeholder.search_company",
    translations: {
      ge: "ძებნა კომპანიის სახელით...",
      en: "Search by company name...",
    },
  },
  {
    namespace: "inputs",
    key: "validation.required",
    translations: {
      ge: "სავალდებულო ველი",
      en: "This field is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.email_required",
    translations: {
      ge: "ელ. ფოსტა სავალდებულოა",
      en: "Email is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.email_invalid",
    translations: {
      ge: "ელ. ფოსტის ფორმატი არასწორია",
      en: "Invalid email format",
    },
  },
  {
    namespace: "inputs",
    key: "validation.password_required",
    translations: {
      ge: "პაროლი სავალდებულოა",
      en: "Password is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.password_min",
    translations: {
      ge: "პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს",
      en: "Password must be at least 8 characters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.password_max",
    translations: {
      ge: "პაროლი არ უნდა აღემატებოდეს 64 სიმბოლოს",
      en: "Password must not exceed 64 characters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.password_uppercase",
    translations: {
      ge: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ დიდ ასოს (A-Z)",
      en: "Password must contain at least one uppercase letter",
    },
  },
  {
    namespace: "inputs",
    key: "validation.password_lowercase",
    translations: {
      ge: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ პატარა ასოს (a-z)",
      en: "Password must contain at least one lowercase letter",
    },
  },
  {
    namespace: "inputs",
    key: "validation.password_number",
    translations: {
      ge: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს (0-9)",
      en: "Password must contain at least one number",
    },
  },
  {
    namespace: "inputs",
    key: "validation.password_special",
    translations: {
      ge: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ სპეციალურ სიმბოლოს (!@#$%...)",
      en: "Password must contain at least one special character",
    },
  },
  {
    namespace: "inputs",
    key: "validation.password_mismatch",
    translations: {
      ge: "პაროლები არ ემთხვევა",
      en: "Passwords do not match",
    },
  },
  {
    namespace: "inputs",
    key: "validation.confirm_password",
    translations: {
      ge: "გაიმეორეთ პაროლი",
      en: "Please repeat your password",
    },
  },
  {
    namespace: "inputs",
    key: "validation.id_number_required",
    translations: {
      ge: "პირადი ნომერი სავალდებულოა",
      en: "ID number is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.id_number_digits",
    translations: {
      ge: "პირადი ნომერი უნდა შეიცავდეს მხოლოდ ციფრებს",
      en: "ID number must contain only digits",
    },
  },
  {
    namespace: "inputs",
    key: "validation.id_number_length",
    translations: {
      ge: "პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს",
      en: "ID number must be exactly 11 digits",
    },
  },
  {
    namespace: "inputs",
    key: "validation.id_code_required",
    translations: {
      ge: "საიდენტიფიკაციო კოდი სავალდებულოა",
      en: "Identification code is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.id_code_length",
    translations: {
      ge: "საიდენტიფიკაციო კოდი უნდა შეიცავდეს ზუსტად 9 ციფრს",
      en: "Identification code must be exactly 9 digits",
    },
  },
  {
    namespace: "inputs",
    key: "validation.id_code_digits",
    translations: {
      ge: "საიდენტიფიკაციო კოდი უნდა შეიცავდეს მხოლოდ ციფრებს",
      en: "Identification code must contain only digits",
    },
  },
  {
    namespace: "inputs",
    key: "validation.name_ge_required",
    translations: {
      ge: "სახელი (ქართულად) სავალდებულოა",
      en: "Name (Georgian) is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.name_ge_min",
    translations: {
      ge: "სახელი (ქართულად) უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს",
      en: "Name (Georgian) must be at least 2 characters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.name_ge_letters",
    translations: {
      ge: "სახელი (ქართულად) უნდა შეიცავდეს მხოლოდ ქართულ ასოებს",
      en: "Name (Georgian) must contain only Georgian letters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.name_en_required",
    translations: {
      ge: "სახელი (ინგლისურად) სავალდებულოა",
      en: "Name (English) is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.name_en_min",
    translations: {
      ge: "სახელი (ინგლისურად) უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს",
      en: "Name (English) must be at least 2 characters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.name_en_letters",
    translations: {
      ge: "სახელი (ინგლისურად) უნდა შეიცავდეს მხოლოდ ლათინურ ასოებს",
      en: "Name (English) must contain only Latin letters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.contact_required",
    translations: {
      ge: "საკონტაქტო პირი სავალდებულოა",
      en: "Contact person is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.contact_min",
    translations: {
      ge: "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს",
      en: "Name must be at least 2 characters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.dob_required",
    translations: {
      ge: "დაბადების თარიღი სავალდებულოა",
      en: "Date of birth is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.dob_invalid",
    translations: {
      ge: "დაბადების თარიღი არასწორი ფორმატისაა",
      en: "Date of birth is in an invalid format",
    },
  },
  {
    namespace: "inputs",
    key: "validation.dob_min_age",
    translations: {
      ge: "მომხმარებელი უნდა იყოს მინიმუმ 16 წლის",
      en: "User must be at least 16 years old",
    },
  },
  {
    namespace: "inputs",
    key: "validation.dob_correct",
    translations: {
      ge: "გთხოვთ, შეიყვანოთ სწორი დაბადების თარიღი",
      en: "Please enter a valid date of birth",
    },
  },
  {
    namespace: "inputs",
    key: "validation.city_required",
    translations: {
      ge: "ქალაქი სავალდებულოა",
      en: "City is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.address_required",
    translations: {
      ge: "მისამართი სავალდებულოა",
      en: "Address is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.address_min",
    translations: {
      ge: "მისამართი უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს",
      en: "Address must be at least 5 characters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.address_max",
    translations: {
      ge: "მისამართი არ უნდა აღემატებოდეს 200 სიმბოლოს",
      en: "Address must not exceed 200 characters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.address_ge_letters",
    translations: {
      ge: "მისამართი უნდა იყოს ქართულად",
      en: "Address must be in Georgian",
    },
  },
  {
    namespace: "inputs",
    key: "validation.address_en_required",
    translations: {
      ge: "მისამართი (ინგლისურად) სავალდებულოა",
      en: "Address (English) is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.address_en_letters",
    translations: {
      ge: "მისამართი (ინგლისურად) უნდა იყოს ინგლისურად",
      en: "Address (English) must be in English",
    },
  },
  {
    namespace: "inputs",
    key: "validation.phone_required",
    translations: {
      ge: "ტელეფონის ნომერი სავალდებულოა",
      en: "Phone number is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.phone_format",
    translations: {
      ge: "ტელეფონის ნომერი უნდა იყოს ფორმატში: 5XX XXX XXX",
      en: "Phone number must be in format: 5XX XXX XXX",
    },
  },
  {
    namespace: "inputs",
    key: "validation.description_required",
    translations: {
      ge: "კომპანიის აღწერა აუცილებელია",
      en: "Company description is required",
    },
  },
  {
    namespace: "inputs",
    key: "validation.description_min",
    translations: {
      ge: "აღწერა უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს",
      en: "Description must be at least 10 characters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.description_max",
    translations: {
      ge: "აღწერა არ უნდა აღემატებოდეს 1000 სიმბოლოს",
      en: "Description must not exceed 1000 characters",
    },
  },
  {
    namespace: "inputs",
    key: "validation.terms_required",
    translations: {
      ge: "წესებზე და პირობებზე დათანხმება აუცილებელია",
      en: "You must agree to the terms and conditions",
    },
  },
  {
    namespace: "navigation",
    key: "about",
    translations: {
      ge: "ჩვენ შესახებ",
      en: "About",
    },
  },
  {
    namespace: "navigation",
    key: "products",
    translations: {
      ge: "პროდუქტები",
      en: "Products",
    },
  },
  {
    namespace: "navigation",
    key: "partners",
    translations: {
      ge: "პარტნიორები",
      en: "Partners",
    },
  },
  {
    namespace: "navigation",
    key: "contact",
    translations: {
      ge: "კონტაქტი",
      en: "Contact",
    },
  },
  {
    namespace: "navigation",
    key: "login",
    translations: {
      ge: "შესვლა",
      en: "Login",
    },
  },
  {
    namespace: "navigation",
    key: "register",
    translations: {
      ge: "რეგისტრაცია",
      en: "Register",
    },
  },
  {
    namespace: "navigation",
    key: "forgot_password",
    translations: {
      ge: "პაროლი დაგავიწყდა?",
      en: "Forgot password?",
    },
  },
  {
    namespace: "navigation",
    key: "no_account",
    translations: {
      ge: "არ გაქვს ანგარიში?",
      en: "Don't have an account?",
    },
  },
  {
    namespace: "navigation",
    key: "already_account",
    translations: {
      ge: "უკვე გაქვს ანგარიში? შესვლა",
      en: "Already have an account? Login",
    },
  },
  {
    namespace: "navigation",
    key: "become_partner",
    translations: {
      ge: "გახდი პარტნიორი",
      en: "Become a partner",
    },
  },
  {
    namespace: "navigation",
    key: "back_to_home",
    translations: {
      ge: "მთავარ გვერდზე დაბრუნება",
      en: "Back to home",
    },
  },
  {
    namespace: "navigation",
    key: "back_to_login",
    translations: {
      ge: "შესვლის გვერდზე დაბრუნება",
      en: "Back to login page",
    },
  },
  {
    namespace: "pages",
    key: "login.title",
    translations: {
      ge: "კეთილი იყოს თქვენი მობრძანება",
      en: "Welcome back",
    },
  },
  {
    namespace: "pages",
    key: "login.subtitle",
    translations: {
      ge: "შედი შენს ანგარიშზე გასაგრძელებლად",
      en: "Sign in to your account to continue",
    },
  },
  {
    namespace: "pages",
    key: "register.title",
    translations: {
      ge: "ანგარიშის შექმნა",
      en: "Create an account",
    },
  },
  {
    namespace: "pages",
    key: "register.subtitle",
    translations: {
      ge: "შემოგვიერთდი და აღმოაჩინე ქართული ხელოსნური ნივთები",
      en: "Join us and discover Georgian handcrafted items",
    },
  },
  {
    namespace: "pages",
    key: "forgot_password.title",
    translations: {
      ge: "დაგავიწყდა პაროლი?",
      en: "Forgot password?",
    },
  },
  {
    namespace: "pages",
    key: "forgot_password.subtitle",
    translations: {
      ge: "შეიყვანე შენი მეილი და ჩვენ გამოგიგზავნით პაროლის აღდგენის ბმულს",
      en: "Enter your email and we will send you a password reset link",
    },
  },
  {
    namespace: "pages",
    key: "forgot_password.sent_title",
    translations: {
      ge: "შეამოწმე ელ. ფოსტა",
      en: "Check your email",
    },
  },
  {
    namespace: "pages",
    key: "forgot_password.sent_sub",
    translations: {
      ge: "პაროლის აღდგენის ბმული გაგზავნილია. შეამოწმე შენი შემოსული ფოსტა.",
      en: "Password reset link sent. Check your inbox.",
    },
  },
  {
    namespace: "pages",
    key: "reset_password.title",
    translations: {
      ge: "ახალი პაროლი",
      en: "New password",
    },
  },
  {
    namespace: "pages",
    key: "reset_password.subtitle",
    translations: {
      ge: "შეიყვანე ახალი პაროლი შენი ანგარიშისთვის",
      en: "Enter a new password for your account",
    },
  },
  {
    namespace: "pages",
    key: "reset_password.success_title",
    translations: {
      ge: "პაროლი შეიცვალა!",
      en: "Password changed!",
    },
  },
  {
    namespace: "pages",
    key: "reset_password.success_sub",
    translations: {
      ge: "შეგიძლია ახლა შეხვიდე სისტემაში ახალი პაროლით.",
      en: "You can now log in with your new password.",
    },
  },
  {
    namespace: "pages",
    key: "reset_password.invalid_title",
    translations: {
      ge: "ბმული არასწორია",
      en: "Invalid link",
    },
  },
  {
    namespace: "pages",
    key: "reset_password.invalid_sub",
    translations: {
      ge: "პაროლის აღდგენის ბმული არასწორია ან ვადა გასულია.",
      en: "Password reset link is invalid or has expired.",
    },
  },
  {
    namespace: "pages",
    key: "reset_password.try_again",
    translations: {
      ge: "ახლიდან სცადე",
      en: "Try again",
    },
  },
  {
    namespace: "pages",
    key: "become_partner.title",
    translations: {
      ge: "პარტნიორის რეგისტრაცია",
      en: "Partner registration",
    },
  },
  {
    namespace: "pages",
    key: "become_partner.subtitle",
    translations: {
      ge: "შეავსე ფორმა და გახდი ჩვენი პლატფორმის პარტნიორი",
      en: "Fill the form and become a partner on our platform",
    },
  },
  {
    namespace: "pages",
    key: "home.hero_description",
    translations: {
      ge: "აღმოაჩინეთ ნამდვილი ქართული ხელოვნება და ხელნაკეთი ნივთები, რომლებიც შექმნილია ოსტატი ხელოსნების მიერ.",
      en: "Discover authentic Georgian art and handcrafted items made by master craftsmen.",
    },
  },
  {
    namespace: "pages",
    key: "home.discover_collection",
    translations: {
      ge: "აღმოაჩინე კოლექცია",
      en: "Discover collection",
    },
  },
  {
    namespace: "pages",
    key: "home.discover_partners",
    translations: {
      ge: "აღმოაჩინე პარტნიორები",
      en: "Discover partners",
    },
  },
  {
    namespace: "pages",
    key: "partners.title",
    translations: {
      ge: "პარტნიორების სია",
      en: "Partners list",
    },
  },
  {
    namespace: "pages",
    key: "partners.empty",
    translations: {
      ge: "განყოფილება ცარიელია",
      en: "Section is empty",
    },
  },
  {
    namespace: "pages",
    key: "partners.general_info",
    translations: {
      ge: "ზოგადი ინფორმაცია",
      en: "General information",
    },
  },
  {
    namespace: "pages",
    key: "partners.contact_info",
    translations: {
      ge: "საკონტაქტო ინფორმაცია",
      en: "Contact information",
    },
  },
  {
    namespace: "pages",
    key: "partners.description_label",
    translations: {
      ge: "აღწერა",
      en: "Description",
    },
  },
  {
    namespace: "pages",
    key: "verify.in_progress",
    translations: {
      ge: "მიმდინარეობს დადასტურება...",
      en: "Verification in progress...",
    },
  },
  {
    namespace: "pages",
    key: "verify.already_verified",
    translations: {
      ge: "უკვე დადასტურებულია",
      en: "Already verified",
    },
  },
  {
    namespace: "pages",
    key: "verify.success",
    translations: {
      ge: "დადასტურებულია!",
      en: "Verified!",
    },
  },
  {
    namespace: "pages",
    key: "verify.failed_title",
    translations: {
      ge: "დადასტურება ვერ მოხერხდა",
      en: "Verification failed",
    },
  },
  {
    namespace: "pages",
    key: "verify.re_register",
    translations: {
      ge: "ხელახლა რეგისტრაცია",
      en: "Register again",
    },
  },
  {
    namespace: "pages",
    key: "status.pending",
    translations: {
      ge: "მოლოდინი",
      en: "Pending",
    },
  },
  {
    namespace: "pages",
    key: "status.approved",
    translations: {
      ge: "დადასტურებული",
      en: "Approved",
    },
  },
  {
    namespace: "pages",
    key: "status.rejected",
    translations: {
      ge: "უარყოფილი",
      en: "Rejected",
    },
  },
  {
    namespace: "pages",
    key: "status.all",
    translations: {
      ge: "ყველა",
      en: "All",
    },
  },
  {
    namespace: "pages",
    key: "site.title",
    translations: {
      ge: "ხელოვანი — ქართული ხელნაკეთი ნივთები",
      en: "KHelovani — Georgian handcrafted items",
    },
  },
  {
    namespace: "pages",
    key: "site.description",
    translations: {
      ge: "აღმოაჩინეთ ნამდვილი ქართული ხელოვნება და ხელნაკეთი ნივთები, შექმნილი ოსტატი ხელოსნების მიერ.",
      en: "Discover authentic Georgian art and handcrafted items, created by master craftsmen.",
    },
  },
  {
    namespace: "common",
    key: "delete",
    translations: {
      ge: "წაშლა",
      en: "Delete",
    },
  },
  {
    namespace: "common",
    key: "edit",
    translations: {
      ge: "რედაქტირება",
      en: "Edit",
    },
  },
  {
    namespace: "common",
    key: "confirm",
    translations: {
      ge: "დადასტურება",
      en: "Confirm",
    },
  },
  {
    namespace: "common",
    key: "back",
    translations: {
      ge: "← უკან",
      en: "← Back",
    },
  },
  {
    namespace: "common",
    key: "loading",
    translations: {
      ge: "იტვირთება...",
      en: "Loading...",
    },
  },
  {
    namespace: "common",
    key: "processing",
    translations: {
      ge: "მიმდინარეობს...",
      en: "Processing...",
    },
  },
  {
    namespace: "common",
    key: "sending",
    translations: {
      ge: "იგზავნება...",
      en: "Sending...",
    },
  },
  {
    namespace: "common",
    key: "search",
    translations: {
      ge: "ძებნა",
      en: "Search",
    },
  },
  {
    namespace: "common",
    key: "submit",
    translations: {
      ge: "გაგზავნა",
      en: "Submit",
    },
  },
  {
    namespace: "common",
    key: "close",
    translations: {
      ge: "დახურვა",
      en: "Close",
    },
  },
  {
    namespace: "common",
    key: "view",
    translations: {
      ge: "დეტალურად",
      en: "View details",
    },
  },
  {
    namespace: "common",
    key: "no_results",
    translations: {
      ge: "შედეგი არ მოიძებნა",
      en: "No results found",
    },
  },
  {
    namespace: "common",
    key: "loading_data",
    translations: {
      ge: "იტვირთება მონაცემები...",
      en: "Loading data...",
    },
  },
  {
    namespace: "common",
    key: "read_more",
    translations: {
      ge: "მეტის ნახვა",
      en: "Read more",
    },
  },
  {
    namespace: "navigation",
    key: "terms_link",
    translations: {
      ge: "მომსახურების პირობებსა და კონფიდენციალურობის პოლიტიკას",
      en: "I agree to the Terms of Service and Privacy Policy",
    },
  },
  {
    namespace: "alerts",
    key: "admin_role_not_active",
    translations: {
      ge: "ადმინისტრატორის როლი არ არის აქტიური",
      en: "Admin role is not active",
    },
  },
  {
    namespace: "alerts",
    key: "admin_login_success",
    translations: {
      ge: "ადმინისტრატორი წარმატებით შევიდა სისტემაში",
      en: "Administrator logged in successfully",
    },
  },
  {
    namespace: "alerts",
    key: "org_login_success",
    translations: {
      ge: "ორგანიზაცია წარმატებით შევიდა სისტემაში",
      en: "Organization logged in successfully",
    },
  },
  {
    namespace: "alerts",
    key: "invalid_status",
    translations: {
      ge: "არასწორი სტატუსი",
      en: "Invalid status",
    },
  },
  {
    namespace: "alerts",
    key: "partner_status_updated",
    translations: {
      ge: "პარტნიორის სტატუსი განახლდა",
      en: "Partner status updated",
    },
  },
  {
    namespace: "alerts",
    key: "partner_deleted_db",
    translations: {
      ge: "პარტნიორი უარყოფილია და წაიშალა ბაზიდან",
      en: "Partner rejected and removed from database",
    },
  },
  {
    namespace: "alerts",
    key: "mail_failed_status_unchanged",
    translations: {
      ge: "მეილის გაგზავნა ჩაიშალა, სტატუსი არ განახლებულა",
      en: "Email sending failed, status not updated",
    },
  },
  {
    namespace: "inputs",
    key: "label.full_name",
    translations: {
      ge: "სახელი და გვარი",
      en: "Full Name",
    },
  },
  {
    namespace: "inputs",
    key: "aria.show_password",
    translations: {
      ge: "პაროლის ჩვენება",
      en: "Show password",
    },
  },
  {
    namespace: "navigation",
    key: "logout",
    translations: {
      ge: "გასვლა",
      en: "Logout",
    },
  },
  {
    namespace: "navigation",
    key: "back",
    translations: {
      ge: "უკან",
      en: "Back",
    },
  },
  {
    namespace: "navigation",
    key: "open_menu",
    translations: {
      ge: "მენიუს გახსნა",
      en: "Open menu",
    },
  },
  {
    namespace: "navigation",
    key: "close_menu",
    translations: {
      ge: "მენიუს დახურვა",
      en: "Close menu",
    },
  },
  {
    namespace: "navigation",
    key: "favorites",
    translations: {
      ge: "ფავორიტები",
      en: "Favorites",
    },
  },
  {
    namespace: "pages",
    key: "partnersPage.hero_title",
    translations: {
      ge: "ჩვენი პარტნიორები",
      en: "Our Partners",
    },
  },
  {
    namespace: "pages",
    key: "partnersPage.hero_description",
    translations: {
      ge: "აღმოაჩინეთ საქართველოს გამორჩეული შემქმნელების ავთენტური, ხელნაკეთი ნამუშევრების კრებული.",
      en: "Discover a curated collection of authentic, handmade treasures from Georgia’s most talented creators.",
    },
  },
  {
    namespace: "pages",
    key: "partner_listing.search_placeholder",
    translations: {
      ge: "მოძებნეთ პარტნიორი...",
      en: "Search partners...",
    },
  },
  {
    namespace: "pages",
    key: "partner_listing.view_profile",
    translations: {
      ge: "პროფილის ნახვა",
      en: "View Profile",
    },
  },
  {
    namespace: "pages",
    key: "partner_listing.prev",
    translations: {
      ge: "წინა",
      en: "Prev",
    },
  },
  {
    namespace: "pages",
    key: "partner_listing.next",
    translations: {
      ge: "შემდეგი",
      en: "Next",
    },
  },
  {
    namespace: "pages",
    key: "partner_listing.no_partners_found",
    translations: {
      ge: "პარტნიორები არ მოიძებნა",
      en: "No partners found",
    },
  },
  {
    namespace: "pages",
    key: "partner_profile.about_us",
    translations: {
      ge: "ჩვენს შესახებ",
      en: "About Us",
    },
  },
  {
    namespace: "pages",
    key: "partner_profile.no_description",
    translations: {
      ge: "აღწერა არ არის მითითებული.",
      en: "No description provided.",
    },
  },
  {
    namespace: "pages",
    key: "partner_profile.contact_info",
    translations: {
      ge: "საკონტაქტო ინფო",
      en: "Contact Info",
    },
  },
  {
    namespace: "pages",
    key: "partner_profile.no_contact_info",
    translations: {
      ge: "საკონტაქტო ინფორმაცია არ არის მითითებული.",
      en: "No contact information provided.",
    },
  },
  {
    namespace: "pages",
    key: "partner_profile.error_not_found",
    translations: {
      ge: "პარტნიორი არ მოიძებნა ან წვდომა შეზღუდულია",
      en: "Partner not found or access denied",
    },
  },
  {
    namespace: "auth",
    key: "org_role_not_found",
    translations: {
      ge: "ორგანიზაციის როლი ვერ მოიძებნა",
      en: "Organization role not found",
    },
  },
  {
    namespace: "auth",
    key: "access_denied",
    translations: {
      ge: "წვდომა შეზღუდულია",
      en: "Access denied",
    },
  },
  {
    namespace: "auth",
    key: "partner_not_found",
    translations: {
      ge: "პარტნიორი ვერ მოიძებნა",
      en: "Partner not found",
    },
  },
  {
    namespace: "auth",
    key: "access_denied_only_owner_can_delete",
    translations: {
      ge: "მხოლოდ მფლობელს შეუძლია წაშლა",
      en: "Only the owner can delete this profile",
    },
  },
  {
    namespace: "alerts",
    key: "partner_rejected_deleted",
    translations: {
      ge: "პარტნიორი უარყოფილია და წაიშალა",
      en: "Partner rejected and deleted",
    },
  },
  {
    namespace: "alerts",
    key: "email_send_failed_status_not_updated",
    translations: {
      ge: "მეილის გაგზავნა ჩაიშალა, სტატუსი არ განახლდა",
      en: "Email send failed, status unchanged",
    },
  },
  {
    namespace: "alerts",
    key: "partner_deleted",
    translations: {
      ge: "პარტნიორი წარმატებით წაიშალა",
      en: "Partner successfully deleted",
    },
  },
  {
    namespace: "alerts",
    key: "no_file_uploaded",
    translations: {
      ge: "ფაილი არ არის ატვირთული",
      en: "No file uploaded",
    },
  },
];

async function seed() {
  try {
    const MONGO_URI =
      process.env.MONGODB_URL_TEST ||
      "mongodb+srv://khoshtariagiorgi0:Khelovani-123!@khelovanicluster.bxzgarf.mongodb.net/khelovani";
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for consolidated translation seeding...");

    // 1. Ensure namespaces
    console.log("Seeding namespaces...");
    for (const ns of namespaces) {
      await Namespace.updateOne(
        { _id: ns._id },
        { $set: ns },
        { upsert: true },
      );
    }

    // 2. Seed translations
    console.log("Seeding translations...");
    const chunkSize = 100;
    for (let i = 0; i < translations.length; i += chunkSize) {
      const chunk = translations.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((t) =>
          Translation.updateOne(
            { namespace: t.namespace, key: t.key },
            { $set: { translations: t.translations } },
            { upsert: true },
          ),
        ),
      );
      console.log(`Chunk ${i / chunkSize + 1} completed...`);
    }

    console.log("✅ Translation seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
}

seed();
