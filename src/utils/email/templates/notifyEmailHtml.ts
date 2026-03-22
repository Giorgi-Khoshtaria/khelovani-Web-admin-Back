export interface NotifyEmailData {
  title: string;
  greeting?: string;
  message: string;
  highlightedText: string;
  footerText?: string;
}

export const notifyEmailHtml = ({
  title,
  greeting,
  message,
  highlightedText,
  footerText,
}: NotifyEmailData): string => `
<!DOCTYPE html>
<html lang="ka">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
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
                  ${title}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="color:#555; font-size:15px; line-height:1.6; padding-bottom:28px;">
                ${greeting ? `<p style="margin:0 0 12px;">${greeting}</p>` : ""}
                <p style="margin:0;">
                  ${message}
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <div style="display:inline-block; padding:14px 32px;
                            background:#f0f0f0; color:#222; font-size:18px;
                            font-weight:700; border-radius:8px; letter-spacing:2px;">
                  ${highlightedText}
                </div>
              </td>
            </tr>
            ${
              footerText
                ? `
            <tr>
              <td style="color:#999; font-size:13px; padding-bottom:24px;">
                <p style="margin:0 0 6px;">
                  ${footerText}
                </p>
              </td>
            </tr>
            `
                : ""
            }
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
