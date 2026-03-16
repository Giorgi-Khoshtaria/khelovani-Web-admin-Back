import { transporter } from "./email.js";
import { UserRegistrationVerificationEmailHtml } from "../email-htmls/UserRegistrationVerificationEmailHtml.js";

export const sendVerificationEmail = async (
  email: string,
  verificationLink: string,
  subject: string,
): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: UserRegistrationVerificationEmailHtml(verificationLink),
  });
};
