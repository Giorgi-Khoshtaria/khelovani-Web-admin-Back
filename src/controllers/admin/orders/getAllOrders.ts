import type { Request, Response } from "express";
import Order from "../../../modules/order.modules.js";
import User from "../../../modules/user.modules.js";
import Organisation from "../../../modules/organization.modules.js";
import { OrderStatus } from "../../../types/orderStatus.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";

const MAX_LIMIT = 50;

/**
 * @desc    List every order across all users/partners with search + filters.
 * @route   GET /api/admin/orders
 * @access  Private — admin (orders.viewAll)
 */
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, partner, userId, dateFrom, dateTo } = req.query;

  const query: Record<string, unknown> = {};

  if (status && status !== "all") {
    if ((Object.values(OrderStatus) as string[]).includes(String(status))) {
      query.status = status;
    }
  }
  if (partner) query.partner = partner;
  if (userId) query.user = userId;

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.$gte = new Date(String(dateFrom));
    if (dateTo) createdAt.$lte = new Date(String(dateTo));
    query.createdAt = createdAt;
  }

  // Search spans the order number plus the (referenced) customer + organisation.
  if (search) {
    const rx = { $regex: escapeRegex(String(search)), $options: "i" };
    const [users, orgs] = await Promise.all([
      User.find({ $or: [{ nameGe: rx }, { nameEn: rx }, { email: rx }] })
        .select("_id")
        .lean(),
      Organisation.find({ $or: [{ companyNameGe: rx }, { companyNameEn: rx }] })
        .select("_id")
        .lean(),
    ]);
    query.$or = [
      { orderNumber: rx },
      { user: { $in: users.map((u) => u._id) } },
      { partner: { $in: orgs.map((o) => o._id) } },
    ];
  }

  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(req.query.limit), 10) || 20),
  );
  const skip = (page - 1) * limit;

  // Tab counts are independent of the active status filter.
  const countsFilter = { ...query };
  delete countsFilter.status;

  const [orders, allC, paidC, deliveredC, cancelledC] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "user", select: "nameGe nameEn email" })
      .populate({ path: "partner", select: "companyNameGe companyNameEn" })
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
});
