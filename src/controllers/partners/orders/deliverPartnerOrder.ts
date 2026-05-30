import type { Request, Response } from "express";
import Order from "../../../modules/order.modules.js";
import { OrderStatus } from "../../../types/orderStatus.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Partner marks one of its own orders as delivered (paid → delivered).
 * @route   PATCH /api/partner/orders/:id/deliver
 * @access  Private — partner (organization.orders.update)
 */
export const deliverPartnerOrder = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const order = await Order.findOne({
      _id: req.params.id,
      partner: req.user.id,
    });
    if (!order) throw new AppError("Order not found", 404);

    if (order.status !== OrderStatus.Paid) {
      throw new AppError("invalid_status_transition", 409);
    }

    order.status = OrderStatus.Delivered;
    order.deliveredAt = new Date();
    await order.save();

    sendResponse(res, 200, "Order marked as delivered", order);
  },
);
