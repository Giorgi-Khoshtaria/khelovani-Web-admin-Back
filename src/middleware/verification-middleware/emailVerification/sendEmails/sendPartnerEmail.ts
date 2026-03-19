import { sendNotificationEmail } from "../email-middleware/sendNotificationEmail.js";

export const sendPartnerPasswordEmail = async (
  email: string,
  companyName: string,
  plainPassword: string,
): Promise<void> => {
  await sendNotificationEmail(
    email,
    "თქვენი პაროლი პარტნიორის სისტემისთვის",
    "notify-partner-password",
    companyName,
    plainPassword,
  );
};
