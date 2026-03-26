import { transporter } from "./transporter.js";
import {
  notifyEmailHtml,
  NotifyEmailData,
} from "./templates/notifyEmailHtml.js";

const getNotificationContent = (
  emailType: string,
  recipientName: string,
  highlightedText: string,
): NotifyEmailData => {
  switch (emailType) {
    case "notify-partner-password":
      return {
        titleGeo: "რეგისტრაცია წარმატებით დასრულდა",
        titleEng: "Registration Successful",
        greetingGeo: `გამარჯობა ${recipientName},`,
        greetingEng: `Hello ${recipientName},`,
        messageGeo:
          "თქვენი ორგანიზაცია წარმატებით დარეგისტრირდა. სისტემაში შესასვლელად გამოიყენეთ ქვემოთ მოცემული პაროლი:",
        messageEng:
          "Your organization has been successfully registered. Please use the password below to log in to the system:",
        highlightedText,
        footerTextGeo: "გთხოვთ, შეცვალოთ პაროლი სისტემაში შესვლის შემდეგ.",
        footerTextEng: "Please change your password after logging in.",
      };
    default:
      return {
        titleGeo: "შეტყობინება",
        titleEng: "Notification",
        messageGeo: "თქვენ გაქვთ ახალი შეტყობინება",
        messageEng: "You have a new notification",
        highlightedText,
      };
  }
};

export const sendNotificationEmail = async (
  email: string,
  subject: string,
  emailType: string,
  recipientName: string = "",
  highlightedText: string = "",
): Promise<void> => {
  const bilingualSubject =
    emailType === "notify-partner-password"
      ? "თქვენი პაროლი / Your Password"
      : subject;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: bilingualSubject,
    html: notifyEmailHtml(
      getNotificationContent(emailType, recipientName, highlightedText),
    ),
  });
};
