import { validateEmail } from "../shared/email.validation.js";
import { validatePassword } from "../shared/password.validation.js";
import { validateCity } from "../shared/city.validation.js";
import { validatePhone } from "../shared/phone.validation.js";
import { PartnerRegisterData } from "../../types/partnerTypes.js";
import Admin from "../../modules/admin.modules.js";
import Organisation from "../../modules/organization.modules.js";
import { Lang } from "../../types/lang.types.js";
import { useTranslation } from "../../types/translate.util.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export interface ValidationError {
  field: string;
  message: string;
}

export const validatePartnerRegistration = async (
  data: Partial<PartnerRegisterData>,
  lang: Lang = "ge",
): Promise<ValidationError[]> => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
  const errors: ValidationError[] = [];

  if (!data.companyNameGe || data.companyNameGe.trim() === "") {
    errors.push({
      field: "companyNameGe",
      message: tValidation("companyNameGe_required"),
    });
  }

  if (!data.companyNameEn || data.companyNameEn.trim() === "") {
    errors.push({
      field: "companyNameEn",
      message: tValidation("companyNameEn_required"),
    });
  }

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

  if (!data.contactPerson || data.contactPerson.trim() === "") {
    errors.push({
      field: "contactPerson",
      message: tValidation("contactPerson_required"),
    });
  }

  const phoneError = validatePhone(data.phone, lang);
  if (phoneError) errors.push({ field: "phone", message: phoneError });

  const cityError = validateCity(data.city, lang);
  if (cityError) errors.push({ field: "city", message: cityError });

  if (!data.category || data.category.trim() === "") {
    errors.push({
      field: "category",
      message: tValidation("category_required") || "კატეგორია სავალდებულოა",
    });
  }

  const emailError = validateEmail(data.email, lang);
  if (emailError) errors.push({ field: "email", message: emailError });

  if (!data.address || data.address.trim() === "") {
    errors.push({
      field: "address",
      message: tValidation("address_required"),
    });
  } else if (!/^[ა-ჰ0-9\s.,/\\\-()]+$/.test(data.address.trim())) {
    errors.push({
      field: "address",
      message: tValidation("address_needs_georgian"),
    });
  }

  if (!data.addressEn || data.addressEn.trim() === "") {
    errors.push({
      field: "addressEn",
      message: tValidation("addressEn_required"),
    });
  } else if (!/^[a-zA-Z0-9\s.,/\\\-()]+$/.test(data.addressEn.trim())) {
    errors.push({
      field: "addressEn",
      message: tValidation("addressEn_needs_english"),
    });
  }

  if (!data.terms) {
    errors.push({
      field: "terms",
      message: tValidation("terms_required"),
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
        message: tAlerts("org_email_exists"),
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
        message: tAlerts("org_code_exists"),
      });
    }
  }

  return errors;
};

