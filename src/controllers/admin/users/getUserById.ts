import User from "../../../modules/user.modules.js";
import Address from "../../../modules/address.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Get a single end-user by ID, including saved addresses
 * @route   GET /api/admin/users/:id
 * @access  Private Admin — requires users.list permission
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password").lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const addresses = await Address.find({ user: req.params.id })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();

  sendResponse(res, 200, "User retrieved successfully", { ...user, addresses });
});
