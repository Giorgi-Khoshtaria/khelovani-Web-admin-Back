import User from "../../../modules/user.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Delete an end-user by ID
 * @route   DELETE /api/admin/users/:id
 * @access  Private Admin — requires users.delete permission
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  sendResponse(res, 200, "User deleted successfully");
});
