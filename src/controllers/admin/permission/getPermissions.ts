import Permission from "../../../modules/permission.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";

const MAX_LIMIT = 100;

/**
 * @desc    Get all permissions (with Pagination)
 * @route   GET /api/admin/permissions
 * @access  Private Admin
 */
export const getPermissions = asyncHandler(async (req, res) => {
  const { search, category, page = "1", limit = "20" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit as string) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query: any = {};
  if (category && category !== "all") {
    query.category = category;
  }

  if (search) {
    const escaped = escapeRegex(search as string);
    query.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
    ];
  }

  const [permissions, totalCount] = await Promise.all([
    Permission.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(limitNum),
    Permission.countDocuments(query),
  ]);

  sendResponse(res, 200, "Permissions retrieved successfully", permissions, {
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
  });
});
