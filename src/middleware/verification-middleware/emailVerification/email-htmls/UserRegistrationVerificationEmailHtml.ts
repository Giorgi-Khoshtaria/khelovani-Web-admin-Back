export const UserRegistrationVerificationEmailHtml = (
  verificationLink: string,
): string => `
<!DOCTYPE html>
<html lang="ka">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ელ-ფოსტის დადასტურება</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f4f4; font-family: sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:12px;
                   padding:40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <h1 style="margin:0; font-size:22px; color:#222;">
                  ელ-ფოსტის დადასტურება
                </h1>
              </td>
            </tr>
            <tr>
              <td style="color:#555; font-size:15px; line-height:1.6; padding-bottom:28px;">
                <p style="margin:0 0 12px;">გამარჯობა,</p>
                <p style="margin:0;">
                  მადლობა რეგისტრაციისთვის! გთხოვთ დაადასტუროთ თქვენი
                  ელ-ფოსტის მისამართი ქვემოთ მოცემულ ღილაკზე დაჭერით.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <a href="${verificationLink}"
                  style="display:inline-block; padding:14px 32px;
                         background:#222; color:#ffffff; font-size:15px;
                         font-weight:600; border-radius:8px;
                         text-decoration:none; letter-spacing:0.3px;">
                  დაადასტურე ელ-ფოსტა
                </a>
              </td>
            </tr>
            <tr>
              <td style="color:#999; font-size:13px; padding-bottom:24px;">
                <p style="margin:0 0 6px;">
                  თუ ღილაკი არ მუშაობს, დააკოპირე ეს ლინკი ბრაუზერში:
                </p>
                <a href="${verificationLink}"
                  style="color:#555; word-break:break-all; font-size:12px;">
                  ${verificationLink}
                </a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #eee; padding-top:20px;
                         color:#aaa; font-size:12px;">
                <p style="margin:0;">
                  ლინკი მოქმედებს <strong>24 საათი</strong>.
                  თუ თქვენ არ მოგითხოვიათ რეგისტრაცია, უგულებელყავით ეს წერილი.
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
