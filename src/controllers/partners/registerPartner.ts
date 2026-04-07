import type { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import Role from "../../modules/role.modules.js";
import { ROLES } from "../../middleware/role/permissions.js";
import { PartnerRegisterData } from "../../types/partnerTypes.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

// @desc    Register partner
// @route   POST /api/partners/register
// @access  Public
export const registerPartner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);
    const data: PartnerRegisterData = req.body;

    const trimmedEmail = data.email.toLowerCase();
    const trimmedIdCode = data.identificationCode;

    // ── Check email duplicate ──────────────────────────────────────────────
    const existingByEmail = await Organisation.findOne({ email: trimmedEmail });
    if (existingByEmail) {
      res.status(409).json({
        message: tAuth("email_already_exists"),
      });
      return;
    }

    // ── Check identificationCode duplicate ─────────────────────────────────
    const existingByIdCode = await Organisation.findOne({
      identificationCode: trimmedIdCode,
    });
    if (existingByIdCode) {
      const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
      res.status(409).json({
        message: tAlerts("org_code_exists"),
      });
      return;
    }

    // ── Get Partner Role (must be seeded) ──────────────────────────────────
    const partnerRole = await Role.findOne({ name: ROLES.ORGANISATION });
    if (!partnerRole) {
      res.status(500).json({
        message: tAuth("org_role_not_found"),
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
      descriptionEn: data.descriptionEn?.trim(),
      website: data.website?.trim(),
      facebook: data.facebook?.trim(),
      instagram: data.instagram?.trim(),
      tiktok: data.tiktok?.trim(),
      status: PartnerStatusEnum.PENDING,
      password: hashedPassword,
      role: partnerRole._id,
    });

    res.status(201).json({
      message: tAuth("partner_registered"),
      partner: {
        _id: (newOrg as any)._id,
        email: newOrg.email,
      },
    });
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res
      .status(500)
      .json({ message: tAlerts("server_error") || (error as Error).message });
  }
};
