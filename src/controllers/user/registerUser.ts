import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { sendUserRegistrationVerificationEmail } from "../../utils/email/sendUserEmails.js";
import User from "../../modules/user.modules.js";
import { UserTypes } from "../../types/userTypes.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";

// @desc    Register user
// @route   POST /api/user/register
// @access  Public
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { idNumber, nameGe, nameEn, email, phone, password }: UserTypes =
      req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    const trimmedEmail = email.toLowerCase();
    const trimmedIdNumber = idNumber;

    // ── Check email duplicate ──────────────────────────────────────────────
    const existingByEmail = await User.findOne({ email: trimmedEmail });

    if (existingByEmail) {
      if (existingByEmail.isVerified) {
        throw new AppError(
          tAuth("email_already_exists") || "Email already exists",
          409,
        );
      }

      const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
      const isExpired =
        Date.now() - existingByEmail.createdAt.getTime() > THREE_DAYS;

      if (!isExpired) {
        throw new AppError(
          tAuth("register_email_not_verified") ||
            "Account already registered but not verified. Please check your inbox and verify your email.",
          409,
        );
      }

      // Token expired — resend verification without updating fields
      await sendUserRegistrationVerificationEmail(trimmedEmail, lang);
      return sendResponse(
        res,
        200,
        tAuth("verification_email_resent") ||
          "Verification email resent. Please check your inbox.",
      );
    }

    // ── Check idNumber duplicate (separate check) ──────────────────────────
    const existingByIdNumber = await User.findOne({
      idNumber: trimmedIdNumber,
    });

    if (existingByIdNumber) {
      throw new AppError(
        tAuth("id_number_already_exists") || "ID number already exists",
        409,
      );
    }

    // ── Hash + create ──────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      idNumber: trimmedIdNumber,
      nameGe: nameGe?.trim(),
      nameEn: nameEn.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      isVerified: false,
    });

    await sendUserRegistrationVerificationEmail(trimmedEmail, lang);

    sendResponse(
      res,
      201,
      tAuth("register_success_verify_email") ||
        "Registered successfully, verify email",
    );
  },
);
