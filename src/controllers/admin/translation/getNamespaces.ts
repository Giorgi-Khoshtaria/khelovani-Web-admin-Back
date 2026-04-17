import { Namespace } from "../../../modules/translation.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";

/**
 * @desc    Get all namespaces
 * @route   GET /api/admin/namespaces
 * @access  Private Admin
 */
export const getNamespaces = asyncHandler(async (req, res) => {
  const namespaces = await Namespace.find().lean();
  sendResponse(res, 200, "Namespaces retrieved successfully", namespaces);
});
