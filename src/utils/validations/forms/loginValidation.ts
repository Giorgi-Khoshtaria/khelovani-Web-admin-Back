import { validateEmail } from "../shared/email.validation.js";
import { validatePassword } from "../shared/password.validation.js";

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export const validateLoginForm = (data: {
  email?: string;
  password?: string;
}): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordErrors = validatePassword(data.password);
  if (passwordErrors.length > 0) errors.password = passwordErrors[0]; // show first error only

  return errors;
};
