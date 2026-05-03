import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, getCloudinaryPublicId } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

export const deleteProfileImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found", 404);

  if (user.profileImage) {
    const publicId = getCloudinaryPublicId(user.profileImage);
    if (publicId) {
      const cloudinary = (await import("../../utils/config/cloudinary.js")).default;
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    user.profileImage = null as any;
    await user.save();
  }

  sendResponse(res, 200, "image_removed", { profileImage: null });
});
