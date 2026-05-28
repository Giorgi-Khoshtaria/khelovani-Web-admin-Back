import RequestLog from "../../../modules/requestLog.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";

/**
 * @desc    Delete all request logs
 * @route   DELETE /api/admin/logs
 * @access  Private Admin — requires logs.delete permission
 */
export const clearAllLogs = asyncHandler(async (_req, res) => {
  const result = await RequestLog.deleteMany({});
  sendResponse(res, 200, `${result.deletedCount} logs cleared`);
});
