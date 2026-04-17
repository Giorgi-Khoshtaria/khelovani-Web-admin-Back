import User from "../../modules/user.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Delete user by email (for test cleanup)
 * @route   DELETE /api/user/delete-by-email
 * @access  Public (should be protected in production)
 */
export const deleteUserByEmail = asyncHandler(async (req, res) => {
  // Environment check for safety
  if (process.env.NODE_ENV === "production") {
    throw new AppError("Operation not allowed in production", 403);
  }

  const { email } = req.body;
  const result = await User.deleteOne({ email: email.trim().toLowerCase() });

  if (result.deletedCount === 0) {
    throw new AppError("User not found", 404);
  }

  sendResponse(res, 200, "User deleted");
});
