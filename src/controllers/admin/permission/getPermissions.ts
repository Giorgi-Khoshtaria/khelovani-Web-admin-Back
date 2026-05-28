import Permission from "../../../modules/permission.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";

const MAX_LIMIT = 50;

// @desc    Get all permissions
// @route   GET /api/admin/permissions
// @access  Private Admin
export const getPermissions = asyncHandler(async (req, res) => {
  const { search, category } = req.query;

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

  const pageNum = Math.max(1, parseInt(req.query.page as string) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit as string) || MAX_LIMIT));
  const skip = (pageNum - 1) * limitNum;

  const [permissions, totalCount] = await Promise.all([
    Permission.find(query).sort({ category: 1, name: 1 }).skip(skip).limit(limitNum),
    Permission.countDocuments(query),
  ]);

  sendResponse(res, 200, "Permissions retrieved successfully", permissions, {
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
    limit: limitNum,
  });
});
