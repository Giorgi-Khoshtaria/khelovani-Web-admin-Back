import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { generateJWTToken } from "../../utils/token/genereateJWT-token.js";
import { validateLoginForm } from "../../validations/forms/loginValidation.js";
import { PopulatedRole } from "../../types/userTypes.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    // ── Validate fields ──────────────────────────────────────────────────────
    const validationErrors = validateLoginForm({ email, password }, lang);
    if (Object.keys(validationErrors).length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).populate<{ role: PopulatedRole | null }>("role");

    if (!user) {
      res.status(422).json({
        message: tAuth("user_not_found"),
      });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({
        message: tAuth("email_not_verified"),
        code: "EMAIL_NOT_VERIFIED",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(422).json({
        message: tAuth("invalid_email_password"),
      });
      return;
    }

    const token = generateJWTToken({
      id: user._id.toString(),
      role: user.role?.name || "user",
      permissions: user.role?.permissions || [],
      allowedPanels: user.role?.allowedPanels || [],
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      message: tAuth("login_success"),
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

