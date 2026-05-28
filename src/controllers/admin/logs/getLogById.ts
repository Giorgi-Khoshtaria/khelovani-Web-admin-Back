import RequestLog from "../../../modules/requestLog.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Get a single request log by id (includes body + stack)
 * @route   GET /api/admin/logs/:id
 * @access  Private Admin — requires logs.view permission
 */
export const getLogById = asyncHandler(async (req, res) => {
  const log = await RequestLog.findById(req.params.id).lean();
  if (!log) throw new AppError("Log not found", 404);
  sendResponse(res, 200, "Log retrieved successfully", log);
});
