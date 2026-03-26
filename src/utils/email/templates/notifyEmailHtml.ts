export interface NotifyEmailData {
  titleGeo: string;
  titleEng: string;
  greetingGeo?: string;
  greetingEng?: string;
  messageGeo: string;
  messageEng: string;
  highlightedText: string;
  footerTextGeo?: string;
  footerTextEng?: string;
}

export const notifyEmailHtml = ({
  titleGeo,
  titleEng,
  greetingGeo,
  greetingEng,
  messageGeo,
  messageEng,
  highlightedText,
  footerTextGeo,
  footerTextEng,
}: NotifyEmailData): string => `
<!DOCTYPE html>
<html lang="ka">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${titleGeo} / ${titleEng}</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f4f4; font-family: sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          
          <!-- GEORGIAN SECTION -->
          <table width="480" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:12px;
                   padding:40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); margin-bottom: 30px;">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <h1 style="margin:0; font-size:22px; color:#222; font-weight:700;">
                  ${titleGeo}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="color:#444; font-size:15px; line-height:1.6; padding-bottom:28px;">
                ${greetingGeo ? `<p style="margin:0 0 12px; font-weight:700;">${greetingGeo}</p>` : ""}
                <p style="margin:0;">
                  ${messageGeo}
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
              footerTextGeo
                ? `
            <tr>
              <td style="color:#888; font-size:13px; padding-bottom:24px;">
                <p style="margin:0;">
                  ${footerTextGeo}
                </p>
              </td>
            </tr>
            `
                : ""
            }
          </table>

          <!-- ENGLISH SECTION -->
          <table width="480" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:12px;
                   padding:40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <h1 style="margin:0; font-size:22px; color:#222; font-weight:700;">
                  ${titleEng}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="color:#444; font-size:15px; line-height:1.6; padding-bottom:28px;">
                ${greetingEng ? `<p style="margin:0 0 12px; font-weight:700;">${greetingEng}</p>` : ""}
                <p style="margin:0;">
                  ${messageEng}
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
              footerTextEng
                ? `
            <tr>
              <td style="color:#888; font-size:13px; padding-bottom:24px;">
                <p style="margin:0;">
                  ${footerTextEng}
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
