import { sendNotificationEmail } from "./sendNotificationEmail.js";
import { sendEmail } from "./transporter.js";
import {
  partnerInquiryHtml,
  type PartnerInquiryEmailData,
} from "./templates/partnerInquiryHtml.js";
import {
  reviewNotificationHtml,
  type ReviewNotificationEmailData,
} from "./templates/reviewNotificationHtml.js";

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

/**
 * Notifies a partner that a customer rated them. The reviewer's address is the
 * Reply-To so the partner can follow up directly.
 */
export const sendPartnerReviewEmail = async (
  partnerEmail: string,
  data: ReviewNotificationEmailData,
): Promise<void> => {
  const subject = data.isUpdate
    ? `Khelovani · ${data.rating}★ განახლებული შეფასება / Updated rating`
    : `Khelovani · ${data.rating}★ ახალი შეფასება / New rating`;

  await sendEmail({
    to: partnerEmail,
    subject,
    html: reviewNotificationHtml(data),
    replyTo: {
      email: data.reviewerEmail,
      name: data.reviewerNameEn || data.reviewerNameGe,
    },
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
