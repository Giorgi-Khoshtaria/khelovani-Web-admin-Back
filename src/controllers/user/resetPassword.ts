import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

// @desc    Reset password
// @route   POST /api/user/reset-password
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, password } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    // Verify the token
    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch {
      res.status(400).json({ message: tAuth("token_invalid") });
      return;
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      res.status(404).json({ message: tAuth("user_not_found") });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({
      message: tAuth("password_reset_success"),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
