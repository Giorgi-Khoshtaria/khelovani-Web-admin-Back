import { UserTypes } from "../../types/userTypes.js";
import { validateEmail } from "../shared/email.validation.js";
import { validatePassword } from "../shared/password.validation.js";
import { validateCity } from "../shared/city.validation.js";
import { validateNameGe, validateNameEn } from "../shared/name.validation.js";
import { validatePhone } from "../shared/phone.validation.js";
import { Lang } from "../../types/lang.types.js";
import { getTranslation } from "../../types/translate.util.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRegistration = (
  data: Partial<UserTypes>,
  lang: Lang = "ge",
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // ── idNumber ───────────────────────────────────────────────────────────
  if (!data.idNumber || data.idNumber.trim() === "") {
    errors.push({
      field: "idNumber",
      message: getTranslation(TranslationNamespace.Validation, "idNumber_required", lang),
    });
  } else if (!/^\d{11}$/.test(data.idNumber.trim())) {
    errors.push({
      field: "idNumber",
      message: getTranslation(TranslationNamespace.Validation, "idNumber_invalid", lang),
    });
  }

  // ── names ──────────────────────────────────────────────────────────────
  const nameEnError = validateNameEn(data.nameEn, lang);
  if (nameEnError) errors.push({ field: "nameEn", message: nameEnError });

  const nameGeError = validateNameGe(data.nameGe, lang);
  if (nameGeError) errors.push({ field: "nameGe", message: nameGeError });

  // ── dateOfBirth ────────────────────────────────────────────────────────
  if (!data.dateOfBirth) {
    errors.push({
      field: "dateOfBirth",
      message: getTranslation(TranslationNamespace.Validation, "dob_required", lang),
    });
  } else {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push({
        field: "dateOfBirth",
        message: getTranslation(TranslationNamespace.Validation, "dob_invalid", lang),
      });
    } else {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()))
        age--;
      if (age < 16)
        errors.push({
          field: "dateOfBirth",
          message: getTranslation(TranslationNamespace.Validation, "age_limit_16", lang),
        });
      if (age > 120)
        errors.push({
          field: "dateOfBirth",
          message: getTranslation(TranslationNamespace.Validation, "age_limit_120", lang),
        });
    }
  }

  // ── city ───────────────────────────────────────────────────────────────
  const cityError = validateCity(data.city, lang);
  if (cityError) errors.push({ field: "city", message: cityError });

  // ── address ────────────────────────────────────────────────────────────
  if (!data.address || data.address.trim() === "") {
    errors.push({
      field: "address",
      message: getTranslation(TranslationNamespace.Validation, "address_required", lang),
    });
  } else if (data.address.trim().length < 5) {
    errors.push({
      field: "address",
      message: getTranslation(TranslationNamespace.Validation, "address_min_length", lang),
    });
  } else if (data.address.trim().length > 200) {
    errors.push({
      field: "address",
      message: getTranslation(TranslationNamespace.Validation, "address_max_length", lang),
    });
  }

  // ── email ──────────────────────────────────────────────────────────────
  const emailError = validateEmail(data.email, lang);
  if (emailError) errors.push({ field: "email", message: emailError });

  // ── password ───────────────────────────────────────────────────────────
  const passwordErrors = validatePassword(data.password, lang);
  passwordErrors.forEach((msg) =>
    errors.push({ field: "password", message: msg }),
  );

  // ── phone ──────────────────────────────────────────────────────────────
  const phoneError = validatePhone(data.phone, lang);
  if (phoneError) errors.push({ field: "phone", message: phoneError });

  return errors;
};
