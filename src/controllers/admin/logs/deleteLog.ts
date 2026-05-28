import RequestLog from "../../../modules/requestLog.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Delete a request log by id
 * @route   DELETE /api/admin/logs/:id
 * @access  Private Admin — requires logs.delete permission
 */
export const deleteLog = asyncHandler(async (req, res) => {
  const log = await RequestLog.findByIdAndDelete(req.params.id);
  if (!log) throw new AppError("Log not found", 404);
  sendResponse(res, 200, "Log deleted successfully");
});
