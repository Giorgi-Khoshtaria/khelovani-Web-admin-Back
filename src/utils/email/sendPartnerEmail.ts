import { sendNotificationEmail } from "./sendNotificationEmail.js";
import { sendEmail } from "./transporter.js";
import {
  partnerInquiryHtml,
  type PartnerInquiryEmailData,
} from "./templates/partnerInquiryHtml.js";

/**
 * Emails a partner a customer inquiry sent from the "Contact artisan" modal.
 * The customer's address is the Reply-To so the partner can answer directly.
 */
export const sendPartnerInquiryEmail = async (
  partnerEmail: string,
  data: PartnerInquiryEmailData,
): Promise<void> => {
  await sendEmail({
    to: partnerEmail,
    subject: `Khelovani · ${data.subject}`,
    html: partnerInquiryHtml(data),
    replyTo: { email: data.senderEmail, name: data.senderName },
  });
};

export const sendPartnerPasswordEmail = async (
  email: string,
  companyName: string,
  plainPassword: string,
): Promise<void> => {
  await sendNotificationEmail(
    email,
    "", // Subject is handled bilingually in sendNotificationEmail for this type
    "notify-partner-password",
    companyName,
    plainPassword,
  );
};
