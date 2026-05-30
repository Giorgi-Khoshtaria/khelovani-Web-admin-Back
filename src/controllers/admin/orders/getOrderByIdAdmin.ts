import type { Request, Response } from "express";
import Order from "../../../modules/order.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Get any single order (admin).
 * @route   GET /api/admin/orders/:id
 * @access  Private — admin (orders.viewAll)
 */
export const getOrderByIdAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id)
      .populate({ path: "user", select: "nameGe nameEn email" })
      .populate({ path: "partner", select: "companyNameGe companyNameEn" })
      .lean();

    if (!order) throw new AppError("Order not found", 404);

    sendResponse(res, 200, "Order retrieved", order);
  },
);
