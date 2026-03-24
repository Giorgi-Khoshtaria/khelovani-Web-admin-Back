import { getTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export const validatePhone = (
  phone?: string,
  lang: Lang = "ge",
): string | null => {
  if (!phone || phone.trim() === "")
    return getTranslation(TranslationNamespace.Validation, "phone_required", lang);
  if (!/^5\d{2}\s?\d{3}\s?\d{3}$/.test(phone.trim()))
    return getTranslation(TranslationNamespace.Validation, "phone_invalid", lang);
  return null;
};
