export const verifyEmailHTML = (
  verificationLink: string,
  {
    btnTextGeo,
    btnTextEng,
    emailDescriptionGeo,
    emailDescriptionEng,
  }: {
    btnTextGeo: string;
    btnTextEng: string;
    emailDescriptionGeo: string;
    emailDescriptionEng: string;
  },
): string => `
<!DOCTYPE html>
<html lang="ka">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>დადასტურება / Verification</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f4f4; font-family: sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          
          <!-- GEORGIAN SECTION -->
          <table width="460" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:12px;
                   padding:36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin-bottom: 30px;">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <h1 style="margin:0; font-size:18px; color:#222; font-weight:700;">
                  ელ-ფოსტის დადასტურება
                </h1>
              </td>
            </tr>
            <tr>
              <td style="color:#444; font-size:14px; line-height:1.6; padding-bottom:24px;">
                <p style="margin:0 0 10px; font-weight:700;">გამარჯობა,</p>
                <p style="margin:0;">
                  ${emailDescriptionGeo}
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${verificationLink}"
                  style="display:inline-block; padding:12px 28px;
                         background:#1a1a1a; color:#ffffff; font-size:14px;
                         font-weight:600; border-radius:6px;
                         text-decoration:none; letter-spacing:0.3px;">
                  ${btnTextGeo}
                </a>
              </td>
            </tr>
            <tr>
              <td style="color:#888; font-size:12px; padding-bottom:20px;">
                <p style="margin:0 0 4px;">თუ ღილაკი არ მუშაობს, დააკოპირე ლინკი:</p>
                <a href="${verificationLink}" style="color:#666; word-break:break-all;">${verificationLink}</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #eee; padding-top:16px; color:#999; font-size:12px;">
                <p style="margin:0 0 4px;">ლინკი მოქმედებს <strong>24 საათი</strong>.</p>
                <p style="margin:0;">თუ თქვენ არ მოგითხოვიათ მოქმედება, უგულებელყავით.</p>
              </td>
            </tr>
          </table>

          <!-- ENGLISH SECTION -->
          <table width="460" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:12px;
                   padding:36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <h1 style="margin:0; font-size:18px; color:#222; font-weight:700;">
                  Email Verification
                </h1>
              </td>
            </tr>
            <tr>
              <td style="color:#444; font-size:14px; line-height:1.6; padding-bottom:24px;">
                <p style="margin:0 0 10px; font-weight:700;">Hello,</p>
                <p style="margin:0;">
                  ${emailDescriptionEng}
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${verificationLink}"
                  style="display:inline-block; padding:12px 28px;
                         background:#1a1a1a; color:#ffffff; font-size:14px;
                         font-weight:600; border-radius:6px;
                         text-decoration:none; letter-spacing:0.3px;">
                  ${btnTextEng}
                </a>
              </td>
            </tr>
            <tr>
              <td style="color:#888; font-size:12px; padding-bottom:20px;">
                <p style="margin:0 0 4px;">If the button doesn't work, copy the link:</p>
                <a href="${verificationLink}" style="color:#666; word-break:break-all;">${verificationLink}</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #eee; padding-top:16px; color:#999; font-size:12px;">
                <p style="margin:0 0 4px;">Link is active for <strong>24 hours</strong>.</p>
                <p style="margin:0;">If you didn't request this action, discard this email.</p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`;
