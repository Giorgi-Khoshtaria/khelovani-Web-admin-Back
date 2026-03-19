import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { PartnerRegisterData } from "../../utils/types/partnerTypes.js";
import { validatePartnerRegistration } from "../../utils/validations/forms/partnerValidation.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendPartnerPasswordEmail } from "../../middleware/verification-middleware/emailVerification/sendEmails/sendPartnerEmail.js";

export const registerPartner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const len = req.query.lang as string;
    const data: PartnerRegisterData = req.body;

    // ── Validate all fields ────────────────────────────────────────────────
    const validationErrors = validatePartnerRegistration(data);
    if (validationErrors.length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    // ── Check for duplicate Organisation ──────────────────────────────────
    const existingOrg = await Organisation.findOne({
      $or: [
        { email: data.email },
        { identificationCode: data.identificationCode },
      ],
    });

    if (existingOrg) {
      res.status(409).json({
        message:
          existingOrg.email === data.email
            ? "ამ ელ. ფოსტით ორგანიზაცია უკვე არსებობს"
            : "ამ საიდენტიფიკაციო კოდით ორგანიზაცია უკვე არსებობს",
      });
      return;
    }

    // ── Generate Random Password ───────────────────────────────────────────
    const plainPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // ── Create Organisation ────────────────────────────────────────────────
    await Organisation.create({
      companyNameGe: data.companyNameGe.trim(),
      companyNameEn: data.companyNameEn.trim(),
      identificationCode: data.identificationCode.trim(),
      contactPerson: data.contactPerson.trim(),
      phone: data.phone.trim(),
      city: data.city.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      address: data.address.trim(),
      description: data.description?.trim(),
      status: "pending",
      password: hashedPassword,
    });

    // ── Send Password Email ────────────────────────────────────────────────
    await sendPartnerPasswordEmail(
      data.email.trim().toLowerCase(),
      data.companyNameGe.trim(),
      plainPassword,
    );

    res.status(201).json({ message: "პარტნიორი წარმატებით დარეგისტრირდა" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
