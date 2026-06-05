import type { Request, Response } from "express";
import Cart from "../../../modules/cart.modules.js";
import Product from "../../../modules/product.modules.js";
import Address from "../../../modules/address.modules.js";
import Order, { type IOrderItem, type IOrder } from "../../../modules/order.modules.js";
import Organisation from "../../../modules/organization.modules.js";
import { nextOrderNumber } from "../../../modules/counter.modules.js";
import { OrderStatus } from "../../../types/orderStatus.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import {
  sendBuyerOrderConfirmationEmail,
  sendPartnerOrderNotificationEmail,
} from "../../../utils/email/sendOrderConfirmationEmail.js";

// Keep in sync with the frontend cart totals (useOrderTotals).
const FREE_SHIPPING_THRESHOLD = 200;
const FLAT_SHIPPING = 10;

const unitPriceOf = (p: any): number =>
  p.isOnSale && p.discountPercent
    ? Math.round(p.price * (1 - p.discountPercent / 100))
    : p.price;

/**
 * @desc    Place an order from the current user's cart. Items are grouped by
 *          partner (product.owner) so each partner gets its own order. All
 *          amounts are recomputed server-side; the cart is emptied on success.
 * @route   POST /api/user/orders/checkout
 * @access  Private — authenticated user
 */
export const checkout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);
  const userId = req.user.id;
  const { addressId, contact } = req.body;

  // 1. Shipping address must belong to the user.
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new AppError("Address not found", 404);

  // 2. Load the cart with populated products.
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    model: Product,
  });
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  // 3. Keep only items whose product still exists and is visible.
  const validItems = cart.items.filter(
    (i: any) => i.product && i.product.isShown !== false,
  );
  if (validItems.length === 0) {
    throw new AppError("No purchasable items in cart", 400);
  }

  // 4. Group by partner (product.owner).
  const groups = new Map<string, any[]>();
  for (const item of validItems) {
    const ownerId = (item.product as any).owner
      ? String((item.product as any).owner)
      : "";
    if (!ownerId) continue; // skip orphaned products defensively
    if (!groups.has(ownerId)) groups.set(ownerId, []);
    groups.get(ownerId)!.push(item);
  }
  if (groups.size === 0) {
    throw new AppError("No purchasable items in cart", 400);
  }

  const shippingSnapshot = {
    label: address.label,
    addressLine: address.addressLine,
    city: address.city,
    postalCode: address.postalCode,
    additionalComment: address.additionalComment,
  };

  // 5. Create one order per partner. On any failure, roll back the ones
  //    already created so we never leave a partial checkout behind.
  const created: { _id: any }[] = [];
  try {
    for (const items of groups.values()) {
      const orderItems: IOrderItem[] = items.map((i: any) => {
        const p = i.product;
        return {
          product: p._id,
          titleGe: p.titleGe,
          titleEn: p.titleEn,
          image: Array.isArray(p.images) ? p.images[0] || "" : "",
          unitPrice: unitPriceOf(p),
          originalPrice: p.price,
          quantity: i.quantity,
        };
      });

      const subtotal = orderItems.reduce(
        (sum, it) => sum + it.unitPrice * it.quantity,
        0,
      );
      const itemsCount = orderItems.reduce((sum, it) => sum + it.quantity, 0);
      const shipping =
        subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;

      const order = await Order.create({
        orderNumber: await nextOrderNumber(),
        user: userId,
        partner: items[0].product.owner,
        items: orderItems,
        itemsCount,
        subtotal,
        shipping,
        total: subtotal + shipping,
        status: OrderStatus.Paid,
        contact,
        shippingAddress: shippingSnapshot,
      });
      created.push(order);
    }
  } catch (err) {
    if (created.length) {
      await Order.deleteMany({ _id: { $in: created.map((o) => o._id) } });
    }
    throw err;
  }

  // 6. Empty the cart now that the orders exist.
  cart.items = [] as typeof cart.items;
  await cart.save();

  // 7. Fire confirmation emails — one to the buyer and one to each partner.
  //    Fire-and-forget: never block the response or fail checkout on email errors.
  void dispatchOrderEmails(created as unknown as IOrder[]);

  sendResponse(res, 201, "Order placed", created);
});

const dispatchOrderEmails = async (orders: IOrder[]): Promise<void> => {
  try {
    const partnerIds = Array.from(new Set(orders.map((o) => String(o.partner))));
    const partners = await Organisation.find({ _id: { $in: partnerIds } })
      .select("email")
      .lean();
    const emailByPartnerId = new Map(
      partners.map((p: any) => [String(p._id), p.email as string]),
    );

    const jobs: Promise<void>[] = [];
    for (const order of orders) {
      jobs.push(sendBuyerOrderConfirmationEmail(order));
      const partnerEmail = emailByPartnerId.get(String(order.partner));
      if (partnerEmail) {
        jobs.push(sendPartnerOrderNotificationEmail(order, partnerEmail));
      }
    }

    const results = await Promise.allSettled(jobs);
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error("[order-email] dispatch failed:", i, r.reason);
      }
    });
  } catch (err) {
    console.error("[order-email] unexpected dispatch error:", err);
  }
};
