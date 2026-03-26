import { validateEmail } from "../shared/email.validation.js";
import { validateCity } from "../shared/city.validation.js";
import { validatePhone } from "../shared/phone.validation.js";
import { validateNameGe } from "../shared/name.validation.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateOrgRegistration = (
  data: Record<string, any>,
  lang: Lang = "ge",
): ValidationError[] => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
  const errors: ValidationError[] = [];

  // ── companyNameGe ──────────────────────────────────────────────────────
  const nameGeError = validateNameGe(data.companyNameGe, lang);
  if (nameGeError)
    errors.push({ field: "companyNameGe", message: nameGeError });

  // ── companyNameEn ──────────────────────────────────────────────────────
  if (!data.companyNameEn || data.companyNameEn.trim() === "") {
    errors.push({
      field: "companyNameEn",
      message: tValidation("companyNameEn_required"),
    });
  } else if (!/^[A-Za-z0-9\s&.,'-]+$/.test(data.companyNameEn.trim())) {
    errors.push({
      field: "companyNameEn",
      message: tValidation("companyNameEn_invalid"),
    });
  }

  // ── identificationCode ─────────────────────────────────────────────────
  if (!data.identificationCode || data.identificationCode.trim() === "") {
    errors.push({
      field: "identificationCode",
      message: tValidation("id_code_required"),
    });
  } else if (!/^\d{9}$/.test(data.identificationCode.trim())) {
    errors.push({
      field: "identificationCode",
      message: tValidation("id_code_invalid"),
    });
  }

  // ── contactPerson ──────────────────────────────────────────────────────
  if (!data.contactPerson || data.contactPerson.trim() === "") {
    errors.push({
      field: "contactPerson",
      message: tValidation("contactPerson_required"),
    });
  } else if (data.contactPerson.trim().length < 2) {
    errors.push({
      field: "contactPerson",
      message: tValidation("contactPerson_min_length"),
    });
  }

  // ── phone ──────────────────────────────────────────────────────────────
  const phoneError = validatePhone(data.phone, lang);
  if (phoneError) errors.push({ field: "phone", message: phoneError });

  // ── city ───────────────────────────────────────────────────────────────
  const cityError = validateCity(data.city, lang);
  if (cityError) errors.push({ field: "city", message: cityError });

  // ── email ──────────────────────────────────────────────────────────────
  const emailError = validateEmail(data.email, lang);
  if (emailError) errors.push({ field: "email", message: emailError });

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
  }

  // ── description (optional) ─────────────────────────────────────────────
  if (data.description && data.description.trim().length > 500) {
    errors.push({
      field: "description",
      message: tValidation("description_max_length"),
    });
  }

  return errors;
};


