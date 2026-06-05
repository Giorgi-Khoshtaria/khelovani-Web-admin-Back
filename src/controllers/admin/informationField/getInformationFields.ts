import InformationField from "../../../modules/informationField.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse, escapeRegex } from "../../../utils/apiResponse.js";

const MAX_LIMIT = 100;

/**
 * @desc    Get paginated list of information fields
 * @route   GET /api/admin/information-fields
 * @access  Private Admin — requires settings.view permission
 */
export const getInformationFields = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, search } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query: Record<string, unknown> = {};

  if (type && type !== "all") {
    query.type = type;
  }

  if (search) {
    const escaped = escapeRegex(String(search));
    query.$or = [
      { key: { $regex: escaped, $options: "i" } },
      { value: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
    ];
  }

  const [items, totalCount] = await Promise.all([
    InformationField.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    InformationField.countDocuments(query),
  ]);

  sendResponse(res, 200, "Information fields retrieved successfully", items, {
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
  });
});
