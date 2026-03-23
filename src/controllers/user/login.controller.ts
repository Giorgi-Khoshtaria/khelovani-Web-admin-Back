import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import User from "../../modules/user.modules.js";
import { generateJWTToken } from "../../utils/token/genereateJWT-token.js";
import { validateLoginForm } from "../../validations/forms/loginValidation.js";
import { PopulatedRole } from "../../types/userTypes.js";
import { getTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const lang = (req.query.lang as Lang) || "ge";

    // ── Validate fields ──────────────────────────────────────────────────────
    const validationErrors = validateLoginForm({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).populate<{ role: PopulatedRole }>("role");

    if (!user) {
      res
        .status(422)
        .json({ message: getTranslation("auth", "user_not_found", lang) });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({
        message: getTranslation("auth", "email_not_verified", lang),
        code: "EMAIL_NOT_VERIFIED",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res
        .status(422)
        .json({
          message: getTranslation("auth", "invalid_email_password", lang),
        });
      return;
    }

    const token = generateJWTToken({
      id: user._id.toString(),
      role: user.role.name,
      permissions: user.role.permissions,
      allowedPanels: user.role.allowedPanels,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      message: getTranslation("auth", "login_success", lang),
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
