import { validateEmail } from "../shared/email.validation.js";
import { Lang } from "../../types/lang.types.js";

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
  const errors: LoginFormErrors = {};

  const emailError = validateEmail(data.email, lang);
  if (emailError) errors.email = emailError;

  return errors;
};
