import { validateEmail } from "../shared/email.validation.js";
import { validatePassword } from "../shared/password.validation.js";
import { Lang } from "../../types/lang.types.js";

export interface ForgotPasswordFormErrors {
  email?: string;
}

export interface ResetPasswordFormErrors {
  password?: string;
}

// ── Validate forgot-password request (only email needed) ──────────────────────
export const validateForgotPassword = (
  data: { email: string },
  lang: Lang = "ge",
): ForgotPasswordFormErrors => {
  const errors: ForgotPasswordFormErrors = {};

  const emailError = validateEmail(data.email, lang);
  if (emailError) errors.email = emailError;

  return errors;
};

// ── Validate reset-password request (token + new password) ───────────────────
export const validateResetPassword = (
  data: { password: string },
  lang: Lang = "ge",
): ResetPasswordFormErrors => {
  const errors: ResetPasswordFormErrors = {};

  const passwordErrors = validatePassword(data.password, lang);
  if (passwordErrors.length > 0) errors.password = passwordErrors[0];

  return errors;
};
