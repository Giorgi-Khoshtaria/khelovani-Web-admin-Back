import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../modules/user.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

interface JwtPayload {
  email: string;
}

export const verifyEmailCallback = asyncHandler(async (req: Request, res: Response) => {
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  const { token } = req.query;

  if (!token || typeof token !== "string") {
    throw new AppError(tAuth("token_not_found") || "Token not found", 400);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      throw new AppError(tAuth("user_not_found") || "User not found", 404);
    }

    if (user.isVerified) {
      return sendResponse(res, 200, tAuth("already_verified") || "Already verified", {
        status: "already_verified",
      });
    }

    await User.findOneAndUpdate({ email: decoded.email }, { isVerified: true });

    sendResponse(res, 200, tAuth("email_verified_success") || "Email verified successfully", {
      status: "verified",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(
        tAuth("verification_link_expired") || "Verification link expired. Please register again.",
        400,
      );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(tAuth("link_invalid") || "Link invalid", 400);
    }
    throw error;
  }
});


