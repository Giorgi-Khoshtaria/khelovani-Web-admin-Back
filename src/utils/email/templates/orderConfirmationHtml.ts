import { getCityLabel } from "../../cities.js";

export interface OrderEmailItem {
  titleGe: string;
  titleEn?: string;
  image: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
}

export interface OrderEmailAddress {
  label?: string;
  addressLine: string;
  city: string;
  postalCode?: string;
  additionalComment?: string;
}

export interface OrderEmailContact {
  person: string;
  email: string;
  phone: string;
}

export type OrderEmailRecipient = "user" | "partner";

export interface OrderConfirmationData {
  recipient: OrderEmailRecipient;
  orderNumber: string;
  items: OrderEmailItem[];
  itemsCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  contact: OrderEmailContact;
  shippingAddress: OrderEmailAddress;
  ctaUrl: string;
}

const money = (n: number): string => `${n.toFixed(2)} ₾`;

const renderItemsRows = (
  items: OrderEmailItem[],
  lang: "ge" | "en",
): string =>
  items
    .map((it) => {
      const title = lang === "en" ? it.titleEn || it.titleGe : it.titleGe;
      const hasDiscount = it.unitPrice < it.originalPrice;
      const priceCell = hasDiscount
        ? `<span style="color:#999; text-decoration:line-through; font-size:11px; display:block;">${money(it.originalPrice)}</span>
           <span style="color:#1a1a1a; font-weight:600;">${money(it.unitPrice)}</span>`
        : `<span style="color:#1a1a1a; font-weight:600;">${money(it.unitPrice)}</span>`;
      const lineTotal = money(it.unitPrice * it.quantity);
      return `
        <tr>
          <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; vertical-align:top; width:64px;">
            <img src="${it.image}" alt="" width="56" height="56"
                 style="border-radius:8px; object-fit:cover; display:block; background:#f4f4f4;" />
          </td>
          <td style="padding:12px 10px; border-bottom:1px solid #f0f0f0; vertical-align:top;">
            <div style="color:#222; font-size:13px; font-weight:600; margin-bottom:4px;">${title}</div>
            <div style="color:#777; font-size:12px;">${lang === "en" ? "Qty" : "რაოდ."}: ${it.quantity}</div>
          </td>
          <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; vertical-align:top; text-align:right; white-space:nowrap;">
            ${priceCell}
            <div style="color:#666; font-size:11px; margin-top:4px;">= ${lineTotal}</div>
          </td>
        </tr>`;
    })
    .join("");

const renderTotals = (
  subtotal: number,
  shipping: number,
  total: number,
  lang: "ge" | "en",
): string => {
  const labels =
    lang === "en"
      ? { sub: "Subtotal", ship: "Shipping", free: "Free", total: "Total" }
      : { sub: "ჯამი", ship: "მიწოდება", free: "უფასო", total: "სულ" };
  const shipCell = shipping === 0
    ? `<span style="color:#1a7a3a; font-weight:600;">${labels.free}</span>`
    : money(shipping);
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr>
        <td style="color:#666; font-size:13px; padding:4px 0;">${labels.sub}</td>
        <td style="color:#222; font-size:13px; padding:4px 0; text-align:right;">${money(subtotal)}</td>
      </tr>
      <tr>
        <td style="color:#666; font-size:13px; padding:4px 0;">${labels.ship}</td>
        <td style="color:#222; font-size:13px; padding:4px 0; text-align:right;">${shipCell}</td>
      </tr>
      <tr>
        <td style="color:#1a1a1a; font-size:15px; font-weight:700; padding:10px 0 0; border-top:1px solid #eee;">${labels.total}</td>
        <td style="color:#1a1a1a; font-size:15px; font-weight:700; padding:10px 0 0; border-top:1px solid #eee; text-align:right;">${money(total)}</td>
      </tr>
    </table>`;
};

const renderAddress = (
  addr: OrderEmailAddress,
  contact: OrderEmailContact,
  lang: "ge" | "en",
): string => {
  const labels =
    lang === "en"
      ? { ship: "Shipping to", contact: "Contact" }
      : { ship: "მიწოდების მისამართი", contact: "კონტაქტი" };
  const city = getCityLabel(addr.city, lang);
  return `
    <div style="margin-top:20px; padding:16px; background:#fafafa; border-radius:8px;">
      <div style="color:#888; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">${labels.ship}</div>
      <div style="color:#222; font-size:13px; line-height:1.6;">
        ${addr.label ? `<strong>${addr.label}</strong><br/>` : ""}
        ${addr.addressLine}<br/>
        ${city}${addr.postalCode ? `, ${addr.postalCode}` : ""}
        ${addr.additionalComment ? `<div style="color:#777; font-size:12px; margin-top:4px;">${addr.additionalComment}</div>` : ""}
      </div>
      <div style="color:#888; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin:14px 0 6px;">${labels.contact}</div>
      <div style="color:#222; font-size:13px; line-height:1.6;">
        ${contact.person}<br/>
        ${contact.phone}<br/>
        <a href="mailto:${contact.email}" style="color:#666; text-decoration:none;">${contact.email}</a>
      </div>
    </div>`;
};

const renderSection = (
  data: OrderConfirmationData,
  lang: "ge" | "en",
): string => {
  const t =
    lang === "en"
      ? {
          title: data.recipient === "user" ? "Payment received" : "New order received",
          orderLabel: "Order",
          greeting:
            data.recipient === "user"
              ? `Hi ${data.contact.person},`
              : "Hello,",
          intro:
            data.recipient === "user"
              ? "Thanks for your purchase! Your payment was successful and your order is being prepared."
              : "You have a new paid order from a customer. Please prepare the items for shipment.",
          items: "Items",
          cta: data.recipient === "user" ? "View my orders" : "Open admin panel",
          fallbackLink: "If the button doesn't work, copy the link:",
          footer:
            data.recipient === "user"
              ? "If you have any questions about this order, just reply to this email."
              : "Manage and fulfill this order from your admin dashboard.",
        }
      : {
          title:
            data.recipient === "user"
              ? "გადახდა მიღებულია"
              : "ახალი შეკვეთა მიიღეთ",
          orderLabel: "შეკვეთა",
          greeting:
            data.recipient === "user"
              ? `გამარჯობა ${data.contact.person},`
              : "გამარჯობა,",
          intro:
            data.recipient === "user"
              ? "მადლობა შენაძენისთვის! გადახდა წარმატებით განხორციელდა და თქვენი შეკვეთა მზადდება."
              : "თქვენ მიიღეთ ახალი ანაზღაურებული შეკვეთა. გთხოვთ მოამზადოთ ნივთები გადასაგზავნად.",
          items: "ნივთები",
          cta:
            data.recipient === "user"
              ? "ჩემი შეკვეთები"
              : "გახსენი ადმინ პანელი",
          fallbackLink: "თუ ღილაკი არ მუშაობს, დააკოპირე ლინკი:",
          footer:
            data.recipient === "user"
              ? "შეკითხვის შემთხვევაში უპასუხეთ ამ წერილს."
              : "შეკვეთის მართვა შესაძლებელია ადმინ პანელიდან.",
        };

  return `
    <table width="520" cellpadding="0" cellspacing="0"
      style="background:#ffffff; border-radius:12px;
             padding:36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin-bottom: 30px;">
      <tr>
        <td align="center" style="padding-bottom: 8px;">
          <h1 style="margin:0; font-size:18px; color:#222; font-weight:700;">
            ${t.title}
          </h1>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 24px;">
          <span style="display:inline-block; font-size:12px; color:#666; background:#f4f4f4; padding:6px 12px; border-radius:999px; letter-spacing:0.3px;">
            ${t.orderLabel} #${data.orderNumber}
          </span>
        </td>
      </tr>
      <tr>
        <td style="color:#444; font-size:14px; line-height:1.6; padding-bottom:16px;">
          <p style="margin:0 0 6px; font-weight:700;">${t.greeting}</p>
          <p style="margin:0;">${t.intro}</p>
        </td>
      </tr>
      <tr>
        <td style="padding-top:8px; padding-bottom:4px;">
          <div style="color:#888; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">${t.items}</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${renderItemsRows(data.items, lang)}
          </table>
        </td>
      </tr>
      <tr>
        <td>${renderTotals(data.subtotal, data.shipping, data.total, lang)}</td>
      </tr>
      <tr>
        <td>${renderAddress(data.shippingAddress, data.contact, lang)}</td>
      </tr>
      <tr>
        <td align="center" style="padding:28px 0 16px;">
          <a href="${data.ctaUrl}"
             style="display:inline-block; padding:12px 28px;
                    background:#1a1a1a; color:#ffffff; font-size:14px;
                    font-weight:600; border-radius:6px;
                    text-decoration:none; letter-spacing:0.3px;">
            ${t.cta}
          </a>
        </td>
      </tr>
      <tr>
        <td style="color:#888; font-size:12px; padding-bottom:20px;">
          <p style="margin:0 0 4px;">${t.fallbackLink}</p>
          <a href="${data.ctaUrl}" style="color:#666; word-break:break-all;">${data.ctaUrl}</a>
        </td>
      </tr>
      <tr>
        <td style="border-top:1px solid #eee; padding-top:16px; color:#999; font-size:12px;">
          <p style="margin:0;">${t.footer}</p>
        </td>
      </tr>
    </table>`;
};

export const orderConfirmationHtml = (data: OrderConfirmationData): string => `
<!DOCTYPE html>
<html lang="ka">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${data.recipient === "user" ? "შეკვეთა / Order" : "ახალი შეკვეთა / New order"} #${data.orderNumber}</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f4f4; font-family: sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          ${renderSection(data, "ge")}
          ${renderSection(data, "en")}
        </td>
      </tr>
    </table>
  </body>
</html>
`;
