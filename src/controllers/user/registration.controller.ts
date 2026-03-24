import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { ROLES } from "../../middleware/role/permissions.js";
import { sendUserRegistrationVerificationEmail } from "../../utils/email/sendUserEmails.js";
import Role from "../../modules/role.modules.js";
import User from "../../modules/user.modules.js";
import { UserTypes } from "../../types/userTypes.js";
import { validateRegistration } from "../../validations/forms/registerValidation.js";
import { getTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";

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
    const lang = (req.query.lang as Lang) || "ge";

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
        await sendUserRegistrationVerificationEmail(trimmedEmail, lang);
        res.status(200).json({
          message: getTranslation("auth", "verification_email_resent", lang),
        });
        return;
      }
      res.status(409).json({
        message: getTranslation("auth", "email_already_exists", lang),
      });
      return;
    }

    // ── Check idNumber duplicate (separate check) ──────────────────────────
    const existingByIdNumber = await User.findOne({
      idNumber: trimmedIdNumber,
    });

    if (existingByIdNumber) {
      res.status(409).json({
        message: getTranslation("auth", "id_number_already_exists", lang),
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

    await sendUserRegistrationVerificationEmail(trimmedEmail, lang);

    res.status(201).json({
      message: getTranslation("auth", "register_success_verify_email", lang),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
