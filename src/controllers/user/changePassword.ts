import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found", 404);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new AppError("old_password_incorrect", 422);

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  sendResponse(res, 200, "password_updated", null);
});
