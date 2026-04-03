import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

// Georgian name
export const validateNameGe = (
  name?: string,
  lang: Lang = "ge",
): string | null => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);

  if (!name || name.trim() === "") return null; // optional
  if (name.trim().length < 2) return tValidation("name_ge_min_length");
  if (name.trim().length > 50) return tValidation("name_ge_max_length");
  if (!/^[\u10D0-\u10FF\s'-]+$/.test(name.trim())) return tValidation("name_ge_letters_only");
  return null;
};

// English name
export const validateNameEn = (
  name?: string,
  lang: Lang = "ge",
): string | null => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);

  if (!name || name.trim() === "") return tValidation("name_en_required");
  if (name.trim().length < 2) return tValidation("name_en_min_length");
  if (name.trim().length > 50) return tValidation("name_en_max_length");
  // Supports letters, spaces, hyphens, and apostrophes (both straight and curly)
  if (!/^[A-Za-z\s'\-’]+$/.test(name.trim())) return tValidation("name_en_letters_only");
  return null;
};

