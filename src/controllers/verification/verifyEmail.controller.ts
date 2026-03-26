import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../modules/user.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

interface JwtPayload {
  email: string;
}

export const verifyEmailCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({
        message: tAuth("token_not_found"),
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      res.status(404).json({
        message: tAuth("user_not_found"),
      });
      return;
    }

    if (user.isVerified) {
      res.status(200).json({
        status: "already_verified",
        message: tAuth("already_verified"),
      });
      return;
    }

    await User.findOneAndUpdate({ email: decoded.email }, { isVerified: true });

    res.status(200).json({
      status: "verified",
      message: tAuth("email_verified_success"),
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(400).json({
        status: "error",
        code: "expired",
        message: tAuth("verification_link_expired"),
      });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({
        status: "error",
        code: "invalid",
        message: tAuth("link_invalid"),
      });
      return;
    }
    res.status(500).json({
      status: "error",
      code: "server",
      message: tAlerts("server_error"),
    });
  }
};


