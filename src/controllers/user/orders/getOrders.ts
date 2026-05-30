import type { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../../../modules/order.modules.js";
import { OrderStatus } from "../../../types/orderStatus.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    List the current user's orders (newest first), optionally filtered
 *          by status, with per-status counts for the filter tabs.
 * @route   GET /api/user/orders?status=&page=&limit=
 * @access  Private — authenticated user
 */
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);
  const userId = req.user.id;

  const statusParam =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20),
  );

  const filter: Record<string, unknown> = { user: userId };
  if (
    statusParam &&
    (Object.values(OrderStatus) as string[]).includes(statusParam)
  ) {
    filter.status = statusParam;
  }

  const [orders, totalCount, statusAgg] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: "partner", select: "companyNameGe companyNameEn" })
      .lean(),
    Order.countDocuments(filter),
    Order.aggregate<{ _id: string; count: number }>([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const counts: Record<string, number> = {
    all: 0,
    [OrderStatus.Paid]: 0,
    [OrderStatus.Delivered]: 0,
    [OrderStatus.Cancelled]: 0,
  };
  for (const row of statusAgg) {
    counts[row._id] = row.count;
    counts.all += row.count;
  }

  sendResponse(res, 200, "Orders retrieved", orders, {
    currentPage: page,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    counts,
  });
});
