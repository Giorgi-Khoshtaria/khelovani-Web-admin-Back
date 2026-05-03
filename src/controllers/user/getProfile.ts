import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  sendResponse(res, 200, "Profile retrieved", user);
});
