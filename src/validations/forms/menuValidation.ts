import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export interface MenuFormErrors {
  labelKa?: string;
  labelEn?: string;
  href?: string;
  order?: string;
}

export const validateMenuItem = (
  data: {
    label?: { ka?: string; en?: string };
    href?: string;
    order?: any;
  },
  lang: Lang = "ge",
): MenuFormErrors => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
  const errors: MenuFormErrors = {};

  // label.ka
  if (!data.label?.ka || data.label.ka.trim() === "") {
    errors.labelKa = tValidation("label_ka_required");
  } else if (data.label.ka.trim().length < 2) {
    errors.labelKa = tValidation("label_ka_min_length");
  }

  // label.en
  if (!data.label?.en || data.label.en.trim() === "") {
    errors.labelEn = tValidation("label_en_required");
  } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(data.label.en.trim())) {
    errors.labelEn = tValidation("label_en_invalid");
  }

  // href
  if (!data.href || data.href.trim() === "") {
    errors.href = tValidation("href_required");
  } else if (!data.href.trim().startsWith("/")) {
    errors.href = tValidation("href_invalid");
  }

  // order
  if (data.order === undefined || data.order === "") {
    errors.order = tValidation("order_required");
  } else {
    const orderNum = Number(data.order);
    if (isNaN(orderNum) || orderNum < 0) {
      errors.order = tValidation("order_invalid");
    }
  }

  return errors;
};


