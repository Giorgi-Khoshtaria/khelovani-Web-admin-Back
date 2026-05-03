import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const { idNumber, nameGe, nameEn, dateOfBirth, city, address, email, phone } = req.body;

  const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
  if (existing) throw new AppError("email_already_in_use", 409);

  const existingId = await User.findOne({ idNumber, _id: { $ne: req.user.id } });
  if (existingId) throw new AppError("idNumber_already_in_use", 409);

  const phone_normalized = phone.replace(/^\+?995\s?/, "");

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { idNumber, nameGe, nameEn, dateOfBirth, city, address, email, phone: phone_normalized },
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) throw new AppError("User not found", 404);

  sendResponse(res, 200, "profile_updated", user);
});
