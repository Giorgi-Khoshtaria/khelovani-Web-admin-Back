import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import Admin from "../../modules/admin.modules.js";
import Role from "../../modules/role.modules.js";
import { ROLES } from "../../middleware/role/permissions.js";
import { PartnerRegisterData } from "../../types/partnerTypes.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { validatePartnerRegistration } from "../../validations/forms/partnerValidation.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const registerPartner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lang = (req.query.lang as string) === "en" ? "en" : "ge";
    const data: PartnerRegisterData = req.body;

    // ── Validate all fields ────────────────────────────────────────────────
    const validationErrors = await validatePartnerRegistration(data, lang);
    if (validationErrors.length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    // ── Get Partner Role (must be seeded) ──────────────────────────────────
    const partnerRole = await Role.findOne({ name: ROLES.ORGANISATION });
    if (!partnerRole) {
      res.status(500).json({
        message: "Organisation role not found. Run seed:roles first.",
      });
      return;
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
