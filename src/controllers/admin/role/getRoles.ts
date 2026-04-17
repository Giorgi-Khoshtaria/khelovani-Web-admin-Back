import Role from "../../../modules/role.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";

const MAX_LIMIT = 100;

/**
 * @desc    Get all roles (with search & pagination)
 * @route   GET /api/admin/roles
 * @access  Private Admin
 */
export const getRoles = asyncHandler(async (req, res) => {
  const { search, panel, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query: any = {};

  if (search) {
    query.name = { $regex: escapeRegex(String(search)), $options: "i" };
  }

  if (panel) {
    query.allowedPanels = String(panel);
  }

  const [roles, totalCount] = await Promise.all([
    Role.find(query)
      .populate("permissions")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    Role.countDocuments(query),
  ]);

  sendResponse(res, 200, "Roles retrieved successfully", roles, {
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
  });
});
