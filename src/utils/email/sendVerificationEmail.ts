import { sendEmail } from "./transporter.js";
import { verifyEmailHTML } from "./templates/verifyEmailHTML.js";

const checkEmailType = (
  emailType: string,
): { btnTextGeo: string; btnTextEng: string; emailDescriptionGeo: string; emailDescriptionEng: string } => {
  switch (emailType) {
    case "registration":
      return {
        btnTextGeo: "დაადასტურე ელ-ფოსტა",
        btnTextEng: "Verify Email",
        emailDescriptionGeo: "მადლობა რეგისტრაციისთვის! გთხოვთ დაადასტუროთ თქვენი ელ-ფოსტის მისამართი ქვემოთ მოცემულ ღილაკზე დაჭერით.",
        emailDescriptionEng: "Thank you for registering! Please verify your email address by clicking the button below.",
      };
    case "forgot-password":
      return {
        btnTextGeo: "აღადგინე პაროლი",
        btnTextEng: "Reset Password",
        emailDescriptionGeo: "პაროლი დაგავიწყდა შეცვალე შენი პაროლი ქვემოთ მოცემულ ღილაკზე დაჭერით.",
        emailDescriptionEng: "Forgot your password? Reset it by clicking the button below.",
      };
    default:
      return {
        btnTextGeo: "",
        btnTextEng: "",
        emailDescriptionGeo: "",
        emailDescriptionEng: "",
      };
  }
};

export const sendVerificationEmail = async (
  email: string,
  verificationLink: string,
  subject: string,
  emailType: string,
): Promise<void> => {
  await sendEmail({
    to: email,
    subject,
    html: verifyEmailHTML(verificationLink, checkEmailType(emailType)),
  });
};
