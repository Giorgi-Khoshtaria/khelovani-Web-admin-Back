import type { Request, Response } from "express";
import Order from "../../../modules/order.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Get a single order owned by the current user.
 * @route   GET /api/user/orders/:id
 * @access  Private — authenticated user
 */
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
  })
    .populate({ path: "partner", select: "companyNameGe companyNameEn" })
    .lean();

  if (!order) throw new AppError("Order not found", 404);

  sendResponse(res, 200, "Order retrieved", order);
});
