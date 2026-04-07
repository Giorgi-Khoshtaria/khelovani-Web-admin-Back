import { sendNotificationEmail } from "./sendNotificationEmail.js";

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

export const sendPartnerStatusEmail = async (
  email: string,
  status: string,
  companyName: string,
): Promise<void> => {
  await sendNotificationEmail(
    email,
    `Partner Status: ${status}`,
    "notify-partner-status",
    companyName,
    status,
  );
};
