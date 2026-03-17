import { validateEmail } from "../shared/email.validation.js";
import { validatePassword } from "../shared/password.validation.js";

export interface ForgotPasswordFormErrors {
  email?: string;
}

export interface ResetPasswordFormErrors {
  password?: string;
}

// ── Validate forgot-password request (only email needed) ──────────────────────
export const validateForgotPassword = (data: {
  email: string;
}): ForgotPasswordFormErrors => {
  const errors: ForgotPasswordFormErrors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  return errors;
};

// ── Validate reset-password request (token + new password) ───────────────────
export const validateResetPassword = (data: {
  password: string;
}): ResetPasswordFormErrors => {
  const errors: ResetPasswordFormErrors = {};

  const passwordErrors = validatePassword(data.password);
  if (passwordErrors.length > 0) errors.password = passwordErrors[0];

  return errors;
};
