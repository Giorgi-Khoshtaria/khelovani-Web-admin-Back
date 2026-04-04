import { validateEmail } from "../shared/email.validation.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export const validateLoginForm = (
  data: {
    email?: string;
    password?: string;
  },
  lang: Lang = "ge",
): LoginFormErrors => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
  const errors: LoginFormErrors = {};

  const emailError = validateEmail(data.email, lang);
  if (emailError) errors.email = emailError;

  if (!data.password || data.password.trim() === "") {
    errors.password = tValidation("password_required");
  }

  return errors;
};
