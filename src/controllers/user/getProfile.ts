import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  sendResponse(res, 200, "Profile retrieved", req.user);
});
