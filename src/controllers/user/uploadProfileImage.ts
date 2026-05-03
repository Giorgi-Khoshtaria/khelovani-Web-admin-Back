import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, getCloudinaryPublicId } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

export const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const file = req.file as Express.Multer.File & { path: string };
  if (!file) throw new AppError("No image provided", 400);

  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found", 404);

  if (user.profileImage) {
    const publicId = getCloudinaryPublicId(user.profileImage);
    if (publicId) {
      const cloudinary = (await import("../../utils/config/cloudinary.js")).default;
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
  }

  user.profileImage = file.path;
  await user.save();

  sendResponse(res, 200, "image_uploaded", { profileImage: user.profileImage });
});
