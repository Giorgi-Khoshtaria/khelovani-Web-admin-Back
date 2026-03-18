import { generateRememberToken } from "../../generateRememberToken.js";
import { sendVerificationEmail } from "../email-middleware/sendVerificationEmail.js";

export const sendUserForgotPasswordEmail = async (
  email: string,
): Promise<void> => {
  const verificationToken = generateRememberToken(email);

  const verificationLink = `${process.env.FRONTEND_URL}/reset-password?token=${verificationToken}`;
  const subject = "მომხმარებლის დავიწყებული პაროლის აღდგენა";
  const emailType = "forgot-password";
  await sendVerificationEmail(email, verificationLink, subject, emailType);
};
