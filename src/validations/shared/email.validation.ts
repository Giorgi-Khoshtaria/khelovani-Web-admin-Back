import { getTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export const validateEmail = (
  email?: string,
  lang: Lang = "ge",
): string | null => {
  if (!email || email.trim() === "")
    return getTranslation(TranslationNamespace.Validation, "email_required", lang);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return getTranslation(TranslationNamespace.Validation, "email_invalid", lang);
  return null;
};
