import { getTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export const validatePassword = (
  password?: string,
  lang: Lang = "ge",
): string[] => {
  const errors: string[] = [];

  if (!password || password === "") {
    errors.push(getTranslation(TranslationNamespace.Validation, "password_required", lang));
    return errors;
  }

  if (password.length < 8)
    errors.push(getTranslation(TranslationNamespace.Validation, "password_min_length", lang));
  if (password.length > 64)
    errors.push(getTranslation(TranslationNamespace.Validation, "password_max_length", lang));
  if (!/[A-Z]/.test(password))
    errors.push(getTranslation(TranslationNamespace.Validation, "password_needs_uppercase", lang));
  if (!/[a-z]/.test(password))
    errors.push(getTranslation(TranslationNamespace.Validation, "password_needs_lowercase", lang));
  if (!/[0-9]/.test(password))
    errors.push(getTranslation(TranslationNamespace.Validation, "password_needs_digit", lang));
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push(
      getTranslation(TranslationNamespace.Validation, "password_needs_special", lang),
    );

  return errors;
};
