import { generateRememberToken } from "../token/generateRememberToken.js";
import { sendVerificationEmail } from "./sendVerificationEmail.js";

export const sendUserRegistrationVerificationEmail = async (
  email: string,
  lang: string = "ge",
): Promise<void> => {
  const verificationToken = generateRememberToken(email);

  const baseUrl = process.env.FRONTEND_WEB_LIVE_URL || process.env.FRONTEND_URL;
  const verificationLink = `${baseUrl}/verify?token=${verificationToken}`;
  const subject = lang === "en" ? "User Email Verification" : "მომხმარებლის რეგისტრაციისთვის ელ-ფოსტის დადასტურება";
  const emailType = "registration";
  await sendVerificationEmail(email, verificationLink, subject, emailType);
};

export const sendUserForgotPasswordEmail = async (
  email: string,
  lang: string = "ge",
): Promise<void> => {
  const verificationToken = generateRememberToken(email);

  const baseUrl = process.env.FRONTEND_WEB_LIVE_URL || process.env.FRONTEND_URL;
  const verificationLink = `${baseUrl}/reset-password?token=${verificationToken}`;
  const subject = lang === "en" ? "Reset Password Request" : "მომხმარებლის დავიწყებული პაროლის აღდგენა";
  const emailType = "forgot-password";
  await sendVerificationEmail(email, verificationLink, subject, emailType);
};
