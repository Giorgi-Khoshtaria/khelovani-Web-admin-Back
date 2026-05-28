import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Organisation from "../../modules/organization.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

/**
 * @desc    Partner reset password (also used for first-time set-password after registration)
 * @route   POST /api/partner/reset-password
 * @access  Public
 */
export const partnerResetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  let decoded: { email: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
  } catch {
    throw new AppError("Invalid or expired token", 400);
  }

  const partner = await Organisation.findOne({ email: decoded.email });
  if (!partner) {
    throw new AppError("Partner not found", 404);
  }

  partner.password = await bcrypt.hash(password, 10);
  await partner.save();

  sendResponse(res, 200, "Password updated successfully");
});
