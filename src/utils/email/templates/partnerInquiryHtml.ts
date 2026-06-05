export interface PartnerInquiryEmailData {
  partnerName: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  message: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Email a partner receives when a customer sends a message through the
 * "Contact artisan" modal. Shows who wrote, the subject and the message; the
 * sender's address is set as Reply-To so the partner can answer directly.
 */
export const partnerInquiryHtml = ({
  partnerName,
  senderName,
  senderEmail,
  senderPhone,
  subject,
  message,
}: PartnerInquiryEmailData): string => {
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const safeSender = escapeHtml(senderName);
  const safeEmail = escapeHtml(senderEmail);
  const safePhone = senderPhone ? escapeHtml(senderPhone) : "";
  const safePartner = escapeHtml(partnerName);

  return `
<!DOCTYPE html>
<html lang="ka">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New inquiry / ახალი შეტყობინება</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f1ec; font-family: sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="520" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:14px; padding:40px;
                   box-shadow: 0 6px 28px rgba(60,40,20,0.08);">
            <tr>
              <td style="padding-bottom: 8px;">
                <span style="font-size:11px; font-weight:700; letter-spacing:1.6px;
                             text-transform:uppercase; color:#9a6b3f;">
                  New inquiry · ახალი შეტყობინება
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 22px;">
                <h1 style="margin:0; font-size:22px; color:#2b2017; font-weight:700;">
                  ${safeSubject}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="color:#444; font-size:15px; line-height:1.6; padding-bottom:18px;">
                <p style="margin:0 0 6px;">
                  გამარჯობა ${safePartner}, თქვენ მიიღეთ ახალი შეტყობინება Khelovani-ზე.
                </p>
                <p style="margin:0;">
                  Hello ${safePartner}, you have a new message on Khelovani.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 18px;">
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#f7f4ef; border-radius:10px; padding:18px;">
                  <tr>
                    <td style="color:#6b4c35; font-size:13px; font-weight:700; padding-bottom:4px;">
                      From · გამომგზავნი
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#2b2017; font-size:15px; padding-bottom:${safePhone ? "4px" : "12px"};">
                      ${safeSender} &lt;${safeEmail}&gt;
                    </td>
                  </tr>
                  ${
                    safePhone
                      ? `<tr>
                    <td style="color:#2b2017; font-size:15px; padding-bottom:12px;">
                      📞 ${safePhone}
                    </td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="color:#6b4c35; font-size:13px; font-weight:700; padding-bottom:6px;">
                      Message · შეტყობინება
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#333; font-size:15px; line-height:1.6;">
                      ${safeMessage}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="color:#888; font-size:13px; line-height:1.6;">
                <p style="margin:0;">
                  უპასუხეთ პირდაპირ ამ ელ-ფოსტას, რომ დაუკავშირდეთ ${safeSender}-ს.<br />
                  Reply directly to this email to reach ${safeSender}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
