import mongoose from "mongoose";
import User from "../../../modules/user.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { logAdminAction } from "../../../utils/audit/logAdminAction.js";

// @desc    Bulk delete end-users by array of IDs
// @route   POST /api/admin/users/bulk-delete
// @access  Private Admin — requires users.delete permission
export const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("ids must be a non-empty array", 422);
  }

  const invalid = ids.filter((id: unknown) => !mongoose.Types.ObjectId.isValid(id as string));
  if (invalid.length > 0) {
    throw new AppError("One or more IDs have an invalid format", 422);
  }

  const result = await User.deleteMany({ _id: { $in: ids } });

  logAdminAction(req, "USERS_BULK_DELETED", "User", undefined, { ids, deletedCount: result.deletedCount });
  sendResponse(res, 200, `${result.deletedCount} user(s) deleted successfully`, {
    deletedCount: result.deletedCount,
  });
});
