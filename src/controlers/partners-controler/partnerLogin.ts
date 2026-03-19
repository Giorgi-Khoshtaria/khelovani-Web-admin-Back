// controllers/users.controller.ts
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../../modules/user.modules.js";
import Role from "../../modules/role.modules.js";
import { UserTypes } from "../../utils/types/userTypes.js";
import { validateRegistration } from "../../utils/validations/forms/registerValidation.js";
import { validateLoginForm } from "../../utils/validations/forms/loginValidation.js";
import { generateJWTToken } from "../../utils/token/genereateJWT-token.js";
import { ROLES } from "../../middleware/role-middleware/permition.js";

// ── Populated Role Type ──────────────────────────────────────────────────────
interface PopulatedRole {
  _id: Types.ObjectId;
  name: string;
  permissions: string[];
  allowedPanels: string[];
  description: string;
  isActive: boolean;
}

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // ── Validate fields ────────────────────────────────────────────────────
    const validationErrors = validateLoginForm({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    // ── Find user + populate role ──────────────────────────────────────────
    const user = await User.findOne({ email }).populate<{
      role: PopulatedRole;
    }>("role");

    if (!user) {
      res.status(422).json({ message: "მომხმარებელი არ მოიძებნა" });
      return;
    }

    // ── Check password ─────────────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(422).json({ message: "არასწორი მეილი ან პაროლი" });
      return;
    }

    // ── Generate JWT with full role data ───────────────────────────────────
    const token = generateJWTToken({
      id: user._id.toString(),
      role: user.role.name,
      permissions: user.role.permissions,
      allowedPanels: user.role.allowedPanels,
    });

    // ── Strip password before sending ─────────────────────────────────────
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      message: "მომხმარებელი წარმატებით შევიდა სისტემაში",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
