import { generateRememberToken } from "../tokens/generateRememberToken.js";
import { sendVerificationEmail } from "./sendVerificationEmail.js";

export const sendUserRegistrationVerificationEmail = async (
  email: string,
): Promise<void> => {
  const verificationToken = generateRememberToken(email);

  const verificationLink = `${process.env.FRONTEND_URL}/verify-user-registration?token=${verificationToken}`;
  const subject = "მომხმარებლის რეგისტრაციისთვის ელ-ფოსტის დადასტურება";
  const emailType = "registration";
  const emailDescription =
    "მადლობა რეგისტრაციისთვის! გთხოვთ დაადასტუროთ თქვენი ელ-ფოსტის მისამართი ქვემოთ მოცემულ ღილაკზე დაჭერით.";
  await sendVerificationEmail(email, verificationLink, subject, emailType);
};

export const sendUserForgotPasswordEmail = async (
  email: string,
): Promise<void> => {
  const verificationToken = generateRememberToken(email);

  const verificationLink = `${process.env.FRONTEND_URL}/reset-password?token=${verificationToken}`;
  const subject = "მომხმარებლის დავიწყებული პაროლის აღდგენა";
  const emailType = "forgot-password";
  await sendVerificationEmail(email, verificationLink, subject, emailType);
};
