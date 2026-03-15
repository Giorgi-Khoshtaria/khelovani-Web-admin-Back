// controllers/users.controller.ts
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { UserTypes } from "../utils/types/userTypes.js";
import { validateRegistration } from "../utils/validations/registerValidation.js";
import { generateJWTToken } from "../utils/token/genereateJWT-token.js";

// ── Populated Role Type ──────────────────────────────────────────────────────
import { Types } from "mongoose";

interface PopulatedRole {
  _id: Types.ObjectId;
  name: string;
  permissions: string[];
  allowedPanels: string[];
  description: string;
  isActive: boolean;
}

// ── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      idNumber,
      nameGe,
      nameEn,
      dateOfBirth,
      city,
      address,
      email,
      password,
    }: UserTypes = req.body;

    // ── Validate all fields ────────────────────────────────────────────────
    const validationErrors = validateRegistration(req.body);
    if (validationErrors.length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    // ── Check for duplicate email or idNumber ──────────────────────────────
    const existingUser = await User.findOne({
      $or: [{ email }, { idNumber }],
    });

    if (existingUser) {
      res.status(409).json({
        message:
          existingUser.email === email
            ? "ამ ელ. ფოსტით მომხმარებელი უკვე არსებობს"
            : "ამ პირადი ნომრით მომხმარებელი უკვე არსებობს",
      });
      return;
    }

    // ── Find default role ──────────────────────────────────────────────────
    const defaultRole = await Role.findOne({ name: "user" });
    if (!defaultRole) {
      res.status(500).json({
        message: "Default role not found. Run seedRoles first.",
      });
      return;
    }

    // ── Hash password & create user ────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      idNumber: idNumber.trim(),
      nameGe: nameGe?.trim(),
      nameEn: nameEn.trim(),
      dateOfBirth,
      city: city.trim().toLowerCase(),
      address: address.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: defaultRole._id,
    });

    res.status(201).json({ message: "მომხმარებელი წარმატებით დარეგისტრირდა" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

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
