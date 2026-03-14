import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import User from "../modules/user.modules.js";
import { UserTypes } from "../../utils/userTypes.js";
import { validateRegistration } from "../../utils/registerValidation.js";

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

    // ── Validate all fields ──────────────────────────────────────────────────
    const validationErrors = validateRegistration(req.body);
    if (validationErrors.length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    // ── Check for duplicate email or idNumber ────────────────────────────────
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

    // ── Hash password & create user ──────────────────────────────────────────
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
    });

    res.status(201).json({ message: "მომხმარებელი წარმატებით დარეგისტრირდა" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(422).json({ message: "მომხმარებელი არ მოიძებნა" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(422).json({ message: "არასწორი მეილი ან პაროლი" });
    }

    res
      .status(200)
      .json({ message: "მომხმარებელი წარმატებით შევიდა სისტემაში" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
