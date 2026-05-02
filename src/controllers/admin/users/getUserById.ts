import User from "../../../modules/user.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Get a single end-user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private Admin — requires users.list permission
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  sendResponse(res, 200, "User retrieved successfully", user);
});
