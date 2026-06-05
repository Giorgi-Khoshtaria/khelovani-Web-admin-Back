import { sendEmail } from "./transporter.js";
import {
  orderConfirmationHtml,
  type OrderConfirmationData,
} from "./templates/orderConfirmationHtml.js";
import type { IOrder } from "../../modules/order.modules.js";

const webBaseUrl = (): string =>
  process.env.FRONTEND_WEB_LIVE_URL || process.env.FRONTEND_URL || "";

const adminBaseUrl = (): string =>
  process.env.FRONTEND_ADMIN_LIVE_URL || process.env.FRONTEND_ADMIN_URL || "";

const toEmailPayload = (
  order: IOrder,
  recipient: "user" | "partner",
): OrderConfirmationData => ({
  recipient,
  orderNumber: order.orderNumber,
  items: order.items.map((it) => ({
    titleGe: it.titleGe,
    titleEn: it.titleEn,
    image: it.image,
    unitPrice: it.unitPrice,
    originalPrice: it.originalPrice,
    quantity: it.quantity,
  })),
  itemsCount: order.itemsCount,
  subtotal: order.subtotal,
  shipping: order.shipping,
  total: order.total,
  contact: {
    person: order.contact.person,
    email: order.contact.email,
    phone: order.contact.phone,
  },
  shippingAddress: {
    label: order.shippingAddress.label,
    addressLine: order.shippingAddress.addressLine,
    city: order.shippingAddress.city,
    postalCode: order.shippingAddress.postalCode,
    additionalComment: order.shippingAddress.additionalComment,
  },
  ctaUrl:
    recipient === "user"
      ? `${webBaseUrl()}/orders`
      : `${adminBaseUrl()}/orders`,
});

export const sendBuyerOrderConfirmationEmail = async (
  order: IOrder,
): Promise<void> => {
  await sendEmail({
    to: order.contact.email,
    subject: `შეკვეთა #${order.orderNumber} დადასტურდა / Order #${order.orderNumber} confirmed`,
    html: orderConfirmationHtml(toEmailPayload(order, "user")),
  });
};

export const sendPartnerOrderNotificationEmail = async (
  order: IOrder,
  partnerEmail: string,
): Promise<void> => {
  await sendEmail({
    to: partnerEmail,
    subject: `ახალი შეკვეთა #${order.orderNumber} / New order #${order.orderNumber}`,
    html: orderConfirmationHtml(toEmailPayload(order, "partner")),
  });
};
