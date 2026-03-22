import { transporter } from "./transporter.js";
import { verifyEmailHTML } from "./templates/verifyEmailHTML.js";

const checkEmailType = (
  emailType: string,
): { btnText: string; emailDescription: string } => {
  switch (emailType) {
    case "registration":
      return {
        btnText: "დაადასტურე ელ-ფოსტა",
        emailDescription:
          "მადლობა რეგისტრაციისთვის! გთხოვთ დაადასტუროთ თქვენი ელ-ფოსტის მისამართი ქვემოთ მოცემულ ღილაკზე დაჭერით.",
      };
    case "forgot-password":
      return {
        btnText: "აღადგინე პაროლი",
        emailDescription:
          "პაროლი დაგავიწყდა შეცვალე შენი პაროლი ქვემოთ მოცემულ ღილაკზე დაჭერით.",
      };
    default:
      return {
        btnText: "",
        emailDescription: "",
      };
  }
};

export const sendVerificationEmail = async (
  email: string,
  verificationLink: string,
  subject: string,
  emailType: string,
): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: verifyEmailHTML(verificationLink, checkEmailType(emailType)),
  });
};
