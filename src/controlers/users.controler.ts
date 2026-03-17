import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { UserTypes } from "../utils/types/userTypes.js";
import { validateRegistration } from "../utils/validations/forms/registerValidation.js";
import { generateJWTToken } from "../utils/token/genereateJWT-token.js";
import { sendUserRegistrationVerificationEmail } from "../middleware/verification-middleware/emailVerification/sendUserEmails/sendUserRegistrationVerificationEmail.js";
import { Types } from "mongoose";
import { ROLES } from "../middleware/role-middleware/permition.js";

interface PopulatedRole {
  _id: Types.ObjectId;
  name: string;
  permissions: string[];
  allowedPanels: string[];
  description: string;
  isActive: boolean;
}

// ── Register ──────────────────────────────────────────────────────────────────
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
      phone,
      password,
    }: UserTypes = req.body;

    // ── Validate ───────────────────────────────────────────────────────────
    const validationErrors = validateRegistration(req.body);
    if (validationErrors.length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedIdNumber = idNumber.trim();

    // ── Check email duplicate ──────────────────────────────────────────────
    const existingByEmail = await User.findOne({ email: trimmedEmail });

    if (existingByEmail) {
      if (!existingByEmail.isVerified) {
        await sendUserRegistrationVerificationEmail(trimmedEmail);
        res.status(200).json({
          message: "ვერიფიკაციის ლინკი ხელახლა გაიგზავნა თქვენს ელ-ფოსტაზე",
        });
        return;
      }
      res.status(409).json({
        message: "ამ ელ. ფოსტით მომხმარებელი უკვე არსებობს",
      });
      return;
    }

    // ── Check idNumber duplicate (separate check) ──────────────────────────
    const existingByIdNumber = await User.findOne({
      idNumber: trimmedIdNumber,
    });

    if (existingByIdNumber) {
      res.status(409).json({
        message: "ამ პირადი ნომრით მომხმარებელი უკვე არსებობს",
      });
      return;
    }

    // ── Default role ───────────────────────────────────────────────────────
    const defaultRole = await Role.findOne({ name: ROLES.USER });
    if (!defaultRole) {
      res.status(500).json({
        message: "Default role not found. Run seedRoles first.",
      });
      return;
    }

    // ── Hash + create ──────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // phone comes as "5XX XXX XXX" from frontend — prepend +995

    await User.create({
      idNumber: trimmedIdNumber,
      nameGe: nameGe?.trim(),
      nameEn: nameEn.trim(),
      dateOfBirth,
      city: city.trim().toLowerCase(),
      address: address.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: defaultRole._id,
      isVerified: false,
    });

    await sendUserRegistrationVerificationEmail(trimmedEmail);

    res.status(201).json({
      message:
        "მომხმარებელი წარმატებით დარეგისტრირდა! გთხოვთ შეამოწმოთ ელ-ფოსტა დასადასტურებლად",
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).populate<{ role: PopulatedRole }>("role");

    if (!user) {
      res.status(422).json({ message: "მომხმარებელი არ მოიძებნა" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({
        message: "გთხოვთ ჯერ დაადასტუროთ ელ-ფოსტა",
        code: "EMAIL_NOT_VERIFIED",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(422).json({ message: "არასწორი მეილი ან პაროლი" });
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
      message: "მომხმარებელი წარმატებით შევიდა სისტემაში",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
