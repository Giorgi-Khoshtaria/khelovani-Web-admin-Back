import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError("ფაილი არ არის ატვირთული", 422);
  }

  // Cloudinary path is available in req.file.path when using multer-storage-cloudinary
  const imageUrl = req.file.path;

  sendResponse(res, 200, "ფაილი წარმატებით აიტვირთა", { url: imageUrl });
});
