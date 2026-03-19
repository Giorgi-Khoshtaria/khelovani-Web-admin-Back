import { transporter } from "./email.js";
import {
  notifyEmailHtml,
  NotifyEmailData,
} from "../email-htmls/notifyEmailHtml.js";

const getNotificationContent = (
  emailType: string,
  recipientName: string,
  highlightedText: string,
): NotifyEmailData => {
  switch (emailType) {
    case "notify-partner-password":
      return {
        title: "რეგისტრაცია წარმატებით დასრულდა",
        greeting: `გამარჯობა <strong>${recipientName}</strong>,`,
        message:
          "თქვენი ორგანიზაცია წარმატებით დარეგისტრირდა. სისტემაში შესასვლელად გამოიყენეთ ქვემოთ მოცემული პაროლი:",
        highlightedText,
        footerText: "გთხოვთ, შეცვალოთ პაროლი სისტემაში შესვლის შემდეგ.",
      };
    default:
      return {
        title: "შეტყობინება",
        message: "თქვენ გაქვთ ახალი შეტყობინება",
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
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: notifyEmailHtml(
      getNotificationContent(emailType, recipientName, highlightedText),
    ),
  });
};
