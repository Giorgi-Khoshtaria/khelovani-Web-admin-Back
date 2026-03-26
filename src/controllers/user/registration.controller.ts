import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { sendUserRegistrationVerificationEmail } from "../../utils/email/sendUserEmails.js";
import User from "../../modules/user.modules.js";
import { UserTypes } from "../../types/userTypes.js";
import { validateRegistration } from "../../validations/forms/registerValidation.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

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
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    // ── Validate ───────────────────────────────────────────────────────────
    const validationErrors = validateRegistration(req.body, lang);
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
          message: tAuth("verification_email_resent"),
        });
        return;
      }
      res.status(409).json({
        message: tAuth("email_already_exists"),
      });
      return;
    }

    // ── Check idNumber duplicate (separate check) ──────────────────────────
    const existingByIdNumber = await User.findOne({
      idNumber: trimmedIdNumber,
    });

    if (existingByIdNumber) {
      res.status(409).json({
        message: tAuth("id_number_already_exists"),
      });
      return;
    }

    // ── Hash + create ──────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

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
      isVerified: false,
    });

    await sendUserRegistrationVerificationEmail(trimmedEmail, lang);

    res.status(201).json({
      message: tAuth("register_success_verify_email"),
    });

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
