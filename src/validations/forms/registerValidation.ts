import { UserTypes } from "../../types/userTypes.js";
import { validateEmail } from "../shared/email.validation.js";
import { validatePassword } from "../shared/password.validation.js";
import { validateCity } from "../shared/city.validation.js";
import { validateNameGe, validateNameEn } from "../shared/name.validation.js";
import { validatePhone } from "../shared/phone.validation.js";
import { Lang } from "../../types/lang.types.js";
import { useTranslation } from "../../types/translate.util.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRegistration = (
  data: Partial<UserTypes>,
  lang: Lang = "ge",
): ValidationError[] => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
  const errors: ValidationError[] = [];

  // ── idNumber ───────────────────────────────────────────────────────────
  if (!data.idNumber || data.idNumber.trim() === "") {
    errors.push({
      field: "idNumber",
      message: tValidation("idNumber_required"),
    });
  } else if (!/^\d{11}$/.test(data.idNumber.trim())) {
    errors.push({
      field: "idNumber",
      message: tValidation("idNumber_invalid"),
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
      message: tValidation("dob_required"),
    });
  } else {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push({
        field: "dateOfBirth",
        message: tValidation("dob_invalid"),
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
          message: tValidation("age_limit_16"),
        });
      if (age > 120)
        errors.push({
          field: "dateOfBirth",
          message: tValidation("age_limit_120"),
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
      message: tValidation("address_required"),
    });
  } else if (data.address.trim().length < 5) {
    errors.push({
      field: "address",
      message: tValidation("address_min_length"),
    });
  } else if (data.address.trim().length > 200) {
    errors.push({
      field: "address",
      message: tValidation("address_max_length"),
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

