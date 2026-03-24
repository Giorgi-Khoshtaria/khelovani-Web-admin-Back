import { getTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

// Georgian name
export const validateNameGe = (
  name?: string,
  lang: Lang = "ge",
): string | null => {
  if (!name || name.trim() === "") return null; // optional
  if (name.trim().length < 2)
    return getTranslation(TranslationNamespace.Validation, "name_ge_min_length", lang);
  if (!/^[\u10D0-\u10FF\s'-]+$/.test(name.trim()))
    return getTranslation(TranslationNamespace.Validation, "name_ge_letters_only", lang);
  return null;
};

// English name
export const validateNameEn = (
  name?: string,
  lang: Lang = "ge",
): string | null => {
  if (!name || name.trim() === "")
    return getTranslation(TranslationNamespace.Validation, "name_en_required", lang);
  if (name.trim().length < 2)
    return getTranslation(TranslationNamespace.Validation, "name_en_min_length", lang);
  if (!/^[A-Za-z\s'-]+$/.test(name.trim()))
    return getTranslation(TranslationNamespace.Validation, "name_en_letters_only", lang);
  return null;
};
