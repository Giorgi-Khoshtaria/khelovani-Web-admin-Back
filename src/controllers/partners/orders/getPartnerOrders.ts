import type { Request, Response } from "express";
import Order from "../../../modules/order.modules.js";
import User from "../../../modules/user.modules.js";
import { OrderStatus } from "../../../types/orderStatus.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

const MAX_LIMIT = 50;

/**
 * @desc    List orders that belong to the authenticated partner only.
 * @route   GET /api/partner/orders
 * @access  Private — partner (organization.orders.view)
 */
export const getPartnerOrders = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError("Unauthorized", 401);

    const { search, status, dateFrom, dateTo } = req.query;
    const query: Record<string, unknown> = { partner: req.user.id };

    if (
      status &&
      status !== "all" &&
      (Object.values(OrderStatus) as string[]).includes(String(status))
    ) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.$gte = new Date(String(dateFrom));
      if (dateTo) createdAt.$lte = new Date(String(dateTo));
      query.createdAt = createdAt;
    }

    if (search) {
      const rx = { $regex: escapeRegex(String(search)), $options: "i" };
      const users = await User.find({
        $or: [{ nameGe: rx }, { nameEn: rx }, { email: rx }],
      })
        .select("_id")
        .lean();
      query.$or = [
        { orderNumber: rx },
        { user: { $in: users.map((u) => u._id) } },
      ];
    }

    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(String(req.query.limit), 10) || 20),
    );
    const skip = (page - 1) * limit;

    const countsFilter = { ...query };
    delete countsFilter.status;

    const [orders, allC, paidC, deliveredC, cancelledC] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "user", select: "nameGe nameEn email" })
        .lean(),
      Order.countDocuments(countsFilter),
      Order.countDocuments({ ...countsFilter, status: OrderStatus.Paid }),
      Order.countDocuments({ ...countsFilter, status: OrderStatus.Delivered }),
      Order.countDocuments({ ...countsFilter, status: OrderStatus.Cancelled }),
    ]);

    const counts = {
      all: allC,
      [OrderStatus.Paid]: paidC,
      [OrderStatus.Delivered]: deliveredC,
      [OrderStatus.Cancelled]: cancelledC,
    };
    const totalCount = query.status
      ? counts[query.status as OrderStatus] ?? 0
      : allC;

    sendResponse(res, 200, "Orders fetched successfully", orders, {
      currentPage: page,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      counts,
    });
  },
);
