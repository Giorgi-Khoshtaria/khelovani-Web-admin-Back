import { validateEmail } from "../shared/email.validation.js";
import { validateCity } from "../shared/city.validation.js";
import { validatePhone } from "../shared/phone.validation.js";
import { validateNameGe } from "../shared/name.validation.js";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateOrgRegistration = (
  data: Record<string, any>,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // ── companyNameGe ──────────────────────────────────────────────────────
  const nameGeError = validateNameGe(data.companyNameGe);
  if (nameGeError)
    errors.push({ field: "companyNameGe", message: nameGeError });

  // ── companyNameEn ──────────────────────────────────────────────────────
  if (!data.companyNameEn || data.companyNameEn.trim() === "") {
    errors.push({
      field: "companyNameEn",
      message: "კომპანიის სახელი (ლათინურად) სავალდებულოა",
    });
  } else if (!/^[A-Za-z0-9\s&.,'-]+$/.test(data.companyNameEn.trim())) {
    errors.push({
      field: "companyNameEn",
      message: "კომპანიის სახელი უნდა შეიცავდეს მხოლოდ ლათინურ სიმბოლოებს",
    });
  }

  // ── identificationCode ─────────────────────────────────────────────────
  if (!data.identificationCode || data.identificationCode.trim() === "") {
    errors.push({
      field: "identificationCode",
      message: "საიდენტიფიკაციო კოდი სავალდებულოა",
    });
  } else if (!/^\d{9}$/.test(data.identificationCode.trim())) {
    errors.push({
      field: "identificationCode",
      message: "საიდენტიფიკაციო კოდი უნდა შეიცავდეს ზუსტად 9 ციფრს",
    });
  }

  // ── contactPerson ──────────────────────────────────────────────────────
  if (!data.contactPerson || data.contactPerson.trim() === "") {
    errors.push({
      field: "contactPerson",
      message: "საკონტაქტო პირის სახელი სავალდებულოა",
    });
  } else if (data.contactPerson.trim().length < 2) {
    errors.push({
      field: "contactPerson",
      message: "საკონტაქტო პირის სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს",
    });
  }

  // ── phone ──────────────────────────────────────────────────────────────
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.push({ field: "phone", message: phoneError });

  // ── city ───────────────────────────────────────────────────────────────
  const cityError = validateCity(data.city);
  if (cityError) errors.push({ field: "city", message: cityError });

  // ── email ──────────────────────────────────────────────────────────────
  const emailError = validateEmail(data.email);
  if (emailError) errors.push({ field: "email", message: emailError });

  // ── address ────────────────────────────────────────────────────────────
  if (!data.address || data.address.trim() === "") {
    errors.push({ field: "address", message: "მისამართი სავალდებულოა" });
  } else if (data.address.trim().length < 5) {
    errors.push({
      field: "address",
      message: "მისამართი უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს",
    });
  }

  // ── description (optional) ─────────────────────────────────────────────
  if (data.description && data.description.trim().length > 500) {
    errors.push({
      field: "description",
      message: "აღწერა არ უნდა აღემატებოდეს 500 სიმბოლოს",
    });
  }

  return errors;
};
