import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, getCloudinaryPublicId } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const { password } = req.body;
  if (!password) throw new AppError("password_required", 400);

  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found", 404);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("old_password_incorrect", 422);

  if (user.profileImage) {
    const publicId = getCloudinaryPublicId(user.profileImage);
    if (publicId) {
      const cloudinary = (await import("../../utils/config/cloudinary.js")).default;
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
  }

  await user.deleteOne();

  sendResponse(res, 200, "account_deleted", null);
});
