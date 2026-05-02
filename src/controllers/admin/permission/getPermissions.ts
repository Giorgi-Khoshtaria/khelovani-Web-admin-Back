import Permission from "../../../modules/permission.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";

// @desc    Get all permissions (no pagination — returns full list)
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

  const permissions = await Permission.find(query).sort({ category: 1, name: 1 });

  sendResponse(res, 200, "Permissions retrieved successfully", permissions);
});
