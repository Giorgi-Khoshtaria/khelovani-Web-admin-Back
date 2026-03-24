import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import Admin from "../../modules/admin.modules.js";
import Role from "../../modules/role.modules.js";
import { PartnerRegisterData } from "../../types/partnerTypes.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { validatePartnerRegistration } from "../../validations/forms/partnerValidation.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendPartnerPasswordEmail } from "../../utils/email/sendPartnerEmail.js";

export const registerPartner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const len = req.query.lang as string;
    const data: PartnerRegisterData = req.body;

    // ── Validate all fields ────────────────────────────────────────────────
    const validationErrors = await validatePartnerRegistration(data);
    if (validationErrors.length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    // ── Get or Create Partner Role ─────────────────────────────────────────
    let partnerRole = await Role.findOne({ name: "organization" });
    if (!partnerRole) {
      partnerRole = await Role.create({
        name: "organization",
        allowedPanels: ["admin"],
        permissions: ["org_management"],
        description:
          "Organization account with access to the admin panel and website",
        isActive: true,
      });
    }

    // ── Generate Random Password ───────────────────────────────────────────
    const plainPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // ── Create Organisation ────────────────────────────────────────────────
    const newOrg = await Organisation.create({
      companyNameGe: data.companyNameGe.trim(),
      companyNameEn: data.companyNameEn.trim(),
      identificationCode: data.identificationCode.trim(),
      contactPerson: data.contactPerson.trim(),
      phone: data.phone.trim(),
      city: data.city.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      address: data.address.trim(),
      addressEn: data.addressEn.trim(),
      description: data.description?.trim(),
      status: PartnerStatusEnum.PENDING,
      password: hashedPassword,
      role: partnerRole._id,
    });

    // Password email will be sent upon Admin Approval in updatePartnerStatus

    res.status(201).json({ message: "partner_registered" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
