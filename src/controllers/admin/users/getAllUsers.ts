import User from "../../../modules/user.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";

const MAX_LIMIT = 100;

/**
 * @desc    Get all end-users with search, date filter, and pagination
 * @route   GET /api/admin/users
 * @access  Private Admin — requires users.list permission
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, unknown> = {};

  if (search) {
    const escaped = escapeRegex(String(search));
    query.$or = [
      { nameGe: { $regex: escaped, $options: "i" } },
      { nameEn: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
      { idNumber: { $regex: escaped, $options: "i" } },
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

  const [users, totalCount] = await Promise.all([
    User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  sendResponse(res, 200, "Users retrieved successfully", users, {
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
  });
});
