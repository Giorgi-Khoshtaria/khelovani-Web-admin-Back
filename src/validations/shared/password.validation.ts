import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export const validatePassword = (
  password?: string,
  lang: Lang = "ge",
): string[] => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
  const errors: string[] = [];

  if (!password || password === "") {
    errors.push(tValidation("password_required"));
    return errors;
  }

  if (password.length < 8) errors.push(tValidation("password_min_length"));
  if (password.length > 64) errors.push(tValidation("password_max_length"));
  if (!/[A-Z]/.test(password)) errors.push(tValidation("password_needs_uppercase"));
  if (!/[a-z]/.test(password)) errors.push(tValidation("password_needs_lowercase"));
  if (!/[0-9]/.test(password)) errors.push(tValidation("password_needs_digit"));
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push(tValidation("password_needs_special"));
  }

  return errors;
};

