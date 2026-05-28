import RequestLog from "../../../modules/requestLog.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";

const MAX_LIMIT = 100;

/**
 * @desc    Get paginated list of request logs
 * @route   GET /api/admin/logs
 * @access  Private Admin — requires logs.view permission
 */
export const getLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    source,
    method,
    search,
    dateFrom,
    dateTo,
  } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, unknown> = {};

  if (status === "error") query.statusCode = { $gte: 400 };
  else if (status === "ok") query.statusCode = { $lt: 400 };

  if (source && ["user", "partner", "admin", "public"].includes(String(source))) {
    query.source = source;
  }

  if (method) {
    query.method = String(method).toUpperCase();
  }

  if (search) {
    const escaped = escapeRegex(String(search));
    query.$or = [
      { url: { $regex: escaped, $options: "i" } },
      { ip: { $regex: escaped, $options: "i" } },
    ];
  }

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.$gte = new Date(String(dateFrom));
    if (dateTo) {
      const to = new Date(String(dateTo));
      to.setHours(23, 59, 59, 999);
      createdAt.$lte = to;
    }
    query.createdAt = createdAt;
  }

  const [items, totalCount] = await Promise.all([
    RequestLog.find(query)
      .select("-requestBody -errorStack")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    RequestLog.countDocuments(query),
  ]);

  sendResponse(res, 200, "Logs retrieved successfully", items, {
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
  });
});
