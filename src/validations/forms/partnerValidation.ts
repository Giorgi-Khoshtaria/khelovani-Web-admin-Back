import { validateEmail } from "../shared/email.validation.js";
import { validatePassword } from "../shared/password.validation.js";
import { validateCity } from "../shared/city.validation.js";
import { validatePhone } from "../shared/phone.validation.js";
import { PartnerRegisterData } from "../../types/partnerTypes.js";
import Admin from "../../modules/admin.modules.js";
import Organisation from "../../modules/organization.modules.js";
import { Lang } from "../../types/lang.types.js";
import { getTranslation } from "../../types/translate.util.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export interface ValidationError {
  field: string;
  message: string;
}

export const validatePartnerRegistration = async (
  data: Partial<PartnerRegisterData>,
  lang: Lang = "ge",
): Promise<ValidationError[]> => {
  const errors: ValidationError[] = [];

  if (!data.companyNameGe || data.companyNameGe.trim() === "") {
    errors.push({
      field: "companyNameGe",
      message: getTranslation(TranslationNamespace.Validation, "companyNameGe_required", lang),
    });
  }

  if (!data.companyNameEn || data.companyNameEn.trim() === "") {
    errors.push({
      field: "companyNameEn",
      message: getTranslation(TranslationNamespace.Validation, "companyNameEn_required", lang),
    });
  }

  if (!data.identificationCode || data.identificationCode.trim() === "") {
    errors.push({
      field: "identificationCode",
      message: getTranslation(TranslationNamespace.Validation, "id_code_required", lang),
    });
  } else if (!/^\d{9}$/.test(data.identificationCode.trim())) {
    errors.push({
      field: "identificationCode",
      message: getTranslation(TranslationNamespace.Validation, "id_code_invalid", lang),
    });
  }

  if (!data.contactPerson || data.contactPerson.trim() === "") {
    errors.push({
      field: "contactPerson",
      message: getTranslation(TranslationNamespace.Validation, "contact_person_required", lang),
    });
  }

  const phoneError = validatePhone(data.phone, lang);
  if (phoneError) errors.push({ field: "phone", message: phoneError });

  const cityError = validateCity(data.city, lang);
  if (cityError) errors.push({ field: "city", message: cityError });

  const emailError = validateEmail(data.email, lang);
  if (emailError) errors.push({ field: "email", message: emailError });

  if (!data.address || data.address.trim() === "") {
    errors.push({
      field: "address",
      message: getTranslation(TranslationNamespace.Validation, "address_required", lang),
    });
  } else if (!/^[ა-ჰ0-9\s.,/\\\-()]+$/.test(data.address.trim())) {
    errors.push({
      field: "address",
      message: getTranslation(TranslationNamespace.Validation, "address_needs_georgian", lang),
    });
  }

  if (!data.addressEn || data.addressEn.trim() === "") {
    errors.push({
      field: "addressEn",
      message: getTranslation(TranslationNamespace.Validation, "addressEn_required", lang),
    });
  } else if (!/^[a-zA-Z0-9\s.,/\\\-()]+$/.test(data.addressEn.trim())) {
    errors.push({
      field: "addressEn",
      message: getTranslation(TranslationNamespace.Validation, "addressEn_needs_english", lang),
    });
  }

  if (!data.terms) {
    errors.push({
      field: "terms",
      message: getTranslation(TranslationNamespace.Validation, "terms_required", lang),
    });
  }

  // ── Database Uniqueness Checks ──────────────────────────────────────────
  if (data.email) {
    const emailExists =
      (await Admin.findOne({ email: data.email.trim().toLowerCase() })) ||
      (await Organisation.findOne({ email: data.email.trim().toLowerCase() }));

    if (emailExists) {
      errors.push({
        field: "email",
        message: getTranslation(TranslationNamespace.Validation, "email_taken", lang),
      });
    }
  }

  if (data.identificationCode) {
    const existingOrgByCode = await Organisation.findOne({
      identificationCode: data.identificationCode.trim(),
    });

    if (existingOrgByCode) {
      errors.push({
        field: "identificationCode",
        message: getTranslation(TranslationNamespace.Validation, "id_code_taken", lang),
      });
    }
  }

  return errors;
};
