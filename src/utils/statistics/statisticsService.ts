import mongoose from "mongoose";
import Order from "../../modules/order.modules.js";
import { OrderStatus } from "../../types/orderStatus.enum.js";

/**
 * Statistics aggregation service.
 *
 * Single source of truth for both the admin and partner statistics pages.
 * Pass a `partner` id to scope every figure to one organisation; omit it for
 * platform-wide (admin) totals.
 *
 * Revenue convention (decided with product): money is only counted for orders
 * in `paid` or `delivered` status — `cancelled` orders never contribute to
 * revenue/units, but are surfaced separately as a count.
 */

export const REVENUE_STATUSES = [OrderStatus.Paid, OrderStatus.Delivered];

export type Granularity = "week" | "month" | "year";

export interface StatisticsParams {
  /** Restrict to a single partner/organisation. Omit for platform-wide. */
  partnerId?: string;
  /** Bucket size for the revenue time-series. Defaults to "month". */
  granularity?: Granularity;
  /** Inclusive lower bound on order createdAt. */
  dateFrom?: Date;
  /** Inclusive upper bound on order createdAt. */
  dateTo?: Date;
  /** How many products to return in the "top products" list. Default 10. */
  topLimit?: number;
}

export interface SummaryStats {
  totalRevenue: number;
  totalOrders: number; // revenue-status orders only
  unitsSold: number;
  avgOrderValue: number;
  paidOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  uniqueCustomers: number;
}

export interface TimeBucket {
  period: string; // e.g. "2026-03", "2026-W12", "2026"
  revenue: number;
  orders: number;
  units: number;
}

export interface TopProduct {
  productId: string;
  titleGe: string;
  titleEn?: string;
  image: string;
  unitsSold: number;
  revenue: number;
}

export interface StatusBreakdownEntry {
  status: OrderStatus;
  count: number;
  revenue: number;
}

export interface StatisticsResult {
  summary: SummaryStats;
  timeSeries: TimeBucket[];
  topProducts: TopProduct[];
  statusBreakdown: StatusBreakdownEntry[];
  granularity: Granularity;
}

/** $dateToString format token for each granularity. */
const PERIOD_FORMAT: Record<Granularity, string> = {
  week: "%G-W%V", // ISO week-year + ISO week number
  month: "%Y-%m",
  year: "%Y",
};

/** Build the shared $match stage from the requested scope + date window. */
const buildMatch = (params: StatisticsParams): Record<string, unknown> => {
  const match: Record<string, unknown> = {};

  if (params.partnerId) {
    match.partner = new mongoose.Types.ObjectId(params.partnerId);
  }

  if (params.dateFrom || params.dateTo) {
    const createdAt: Record<string, Date> = {};
    if (params.dateFrom) createdAt.$gte = params.dateFrom;
    if (params.dateTo) createdAt.$lte = params.dateTo;
    match.createdAt = createdAt;
  }

  return match;
};

/** High-level totals (revenue, orders, units, customers, per-status counts). */
const computeSummary = async (
  baseMatch: Record<string, unknown>
): Promise<SummaryStats> => {
  const [row] = await Order.aggregate([
    { $match: baseMatch },
    {
      $facet: {
        revenue: [
          { $match: { status: { $in: REVENUE_STATUSES } } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$total" },
              totalOrders: { $sum: 1 },
              unitsSold: { $sum: "$itemsCount" },
              customers: { $addToSet: "$user" },
            },
          },
        ],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
      },
    },
  ]);

  const rev = row?.revenue?.[0] ?? {
    totalRevenue: 0,
    totalOrders: 0,
    unitsSold: 0,
    customers: [],
  };

  const statusCounts: Record<string, number> = {};
  for (const s of row?.byStatus ?? []) statusCounts[s._id] = s.count;

  const totalRevenue = rev.totalRevenue ?? 0;
  const totalOrders = rev.totalOrders ?? 0;

  return {
    totalRevenue,
    totalOrders,
    unitsSold: rev.unitsSold ?? 0,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    paidOrders: statusCounts[OrderStatus.Paid] ?? 0,
    deliveredOrders: statusCounts[OrderStatus.Delivered] ?? 0,
    cancelledOrders: statusCounts[OrderStatus.Cancelled] ?? 0,
    uniqueCustomers: (rev.customers ?? []).length,
  };
};

/** Revenue/orders/units bucketed by week, month, or year. */
const computeTimeSeries = async (
  baseMatch: Record<string, unknown>,
  granularity: Granularity
): Promise<TimeBucket[]> => {
  const rows = await Order.aggregate([
    { $match: { ...baseMatch, status: { $in: REVENUE_STATUSES } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: PERIOD_FORMAT[granularity],
            date: "$createdAt",
          },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        units: { $sum: "$itemsCount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((r) => ({
    period: r._id as string,
    revenue: r.revenue,
    orders: r.orders,
    units: r.units,
  }));
};

/** Best-selling products by units, with revenue, from line-item snapshots. */
const computeTopProducts = async (
  baseMatch: Record<string, unknown>,
  limit: number
): Promise<TopProduct[]> => {
  const rows = await Order.aggregate([
    { $match: { ...baseMatch, status: { $in: REVENUE_STATUSES } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        titleGe: { $first: "$items.titleGe" },
        titleEn: { $first: "$items.titleEn" },
        image: { $first: "$items.image" },
        unitsSold: { $sum: "$items.quantity" },
        revenue: {
          $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] },
        },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: limit },
  ]);

  return rows.map((r) => ({
    productId: String(r._id),
    titleGe: r.titleGe,
    titleEn: r.titleEn,
    image: r.image,
    unitsSold: r.unitsSold,
    revenue: r.revenue,
  }));
};

/** Per-status counts + revenue (all statuses, including cancelled). */
const computeStatusBreakdown = async (
  baseMatch: Record<string, unknown>
): Promise<StatusBreakdownEntry[]> => {
  const rows = await Order.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: "$total" },
      },
    },
  ]);

  const byStatus = new Map<string, { count: number; revenue: number }>(
    rows.map((r) => [r._id, { count: r.count, revenue: r.revenue }])
  );

  // Always return every status, even with zero activity, for stable UI.
  return Object.values(OrderStatus).map((status) => ({
    status,
    count: byStatus.get(status)?.count ?? 0,
    revenue: byStatus.get(status)?.revenue ?? 0,
  }));
};

/** Compute the full statistics payload for the given scope. */
export const getStatistics = async (
  params: StatisticsParams = {}
): Promise<StatisticsResult> => {
  const granularity = params.granularity ?? "month";
  const topLimit = params.topLimit ?? 10;
  const baseMatch = buildMatch(params);

  const [summary, timeSeries, topProducts, statusBreakdown] = await Promise.all(
    [
      computeSummary(baseMatch),
      computeTimeSeries(baseMatch, granularity),
      computeTopProducts(baseMatch, topLimit),
      computeStatusBreakdown(baseMatch),
    ]
  );

  return { summary, timeSeries, topProducts, statusBreakdown, granularity };
};
