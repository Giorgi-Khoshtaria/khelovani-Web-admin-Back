import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  /** Optional Reply-To, e.g. so a partner can answer the customer directly. */
  replyTo?: { email: string; name?: string };
}): Promise<void> => {
  await client.transactionalEmails.sendTransacEmail({
    sender: { email: process.env.BREVO_FROM_EMAIL },
    to: [{ email: options.to }],
    ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    subject: options.subject,
    htmlContent: options.html,
  });
};
