export interface ReviewNotificationEmailData {
  partnerNameGe: string;
  partnerNameEn: string;
  reviewerNameGe: string;
  reviewerNameEn: string;
  reviewerEmail: string;
  rating: number;
  comment: string;
  /** True when the customer edited a review they had already left. */
  isUpdate?: boolean;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const starRow = (rating: number): string => {
  const safe = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
};

/**
 * Email a partner receives when a customer rates them from the public
 * profile. Two independent cards stacked vertically — Georgian, then
 * English — matching the registration/verification email's structure, each
 * fully self-contained in its own language (heading, labels and the
 * partner/reviewer name).
 */
export const reviewNotificationHtml = ({
  partnerNameGe,
  partnerNameEn,
  reviewerNameGe,
  reviewerNameEn,
  reviewerEmail,
  rating,
  comment,
  isUpdate,
}: ReviewNotificationEmailData): string => {
  const safePartnerGe = escapeHtml(partnerNameGe);
  const safePartnerEn = escapeHtml(partnerNameEn);
  const safeReviewerGe = escapeHtml(reviewerNameGe);
  const safeReviewerEn = escapeHtml(reviewerNameEn);
  const safeEmail = escapeHtml(reviewerEmail);
  const safeComment = escapeHtml(comment).replace(/\n/g, "<br />");
  const stars = starRow(rating);

  const card = (lang: "ge" | "en"): string => {
    const isGe = lang === "ge";
    const eyebrow = isGe
      ? isUpdate
        ? "განახლებული შეფასება"
        : "ახალი შეფასება"
      : isUpdate
        ? "Updated review"
        : "New review";
    const greeting = isGe
      ? `გამარჯობა ${safePartnerGe}, თქვენ მიიღეთ ახალი შეფასება Khelovani-ზე.`
      : `Hello ${safePartnerEn}, you received a new rating on Khelovani.`;
    const fromLabel = isGe ? "შემფასებელი" : "From";
    const commentLabel = isGe ? "კომენტარი" : "Comment";
    const footer = isGe
      ? "შეფასებები იხილეთ ორგანიზაციის პანელში."
      : "You can see all of your ratings in the organization panel.";
    const reviewerName = isGe ? safeReviewerGe : safeReviewerEn;

    return `
          <table width="480" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:14px; padding:36px;
                   box-shadow: 0 6px 28px rgba(60,40,20,0.08); margin-bottom: 24px;">
            <tr>
              <td style="padding-bottom: 8px;">
                <span style="font-size:11px; font-weight:700; letter-spacing:1.6px;
                             text-transform:uppercase; color:#9a6b3f;">
                  ${eyebrow}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 18px;">
                <span style="font-size:28px; letter-spacing:4px; color:#9a6b3f;">
                  ${stars}
                </span>
                <span style="font-size:16px; color:#2b2017; font-weight:700; padding-left:8px;">
                  ${rating}/5
                </span>
              </td>
            </tr>
            <tr>
              <td style="color:#444; font-size:15px; line-height:1.6; padding-bottom:18px;">
                <p style="margin:0;">${greeting}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 18px;">
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#f7f4ef; border-radius:10px; padding:18px;">
                  <tr>
                    <td style="color:#6b4c35; font-size:13px; font-weight:700; padding-bottom:4px;">
                      ${fromLabel}
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#2b2017; font-size:15px; padding-bottom:12px;">
                      ${reviewerName} &lt;${safeEmail}&gt;
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#6b4c35; font-size:13px; font-weight:700; padding-bottom:6px;">
                      ${commentLabel}
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#333; font-size:15px; line-height:1.6;">
                      ${safeComment}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="color:#888; font-size:13px; line-height:1.6;">
                <p style="margin:0;">${footer}</p>
              </td>
            </tr>
          </table>`;
  };

  return `
<!DOCTYPE html>
<html lang="ka">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New review / ახალი შეფასება</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f1ec; font-family: sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">

          <!-- GEORGIAN SECTION -->
${card("ge")}

          <!-- ENGLISH SECTION -->
${card("en")}

        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
