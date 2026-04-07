import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { PartnerStatusEnum } from "../../../types/partnerStatus.js";
import { generateJWTToken } from "../../../utils/token/genereateJWT-token.js";
import Organisation from "../../../modules/organization.modules.js";
import Admin from "../../../modules/admin.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";

interface PopulatedPermission {
  _id: Types.ObjectId;
  name: string;
}

interface PopulatedRole {
  _id: Types.ObjectId;
  name: string;
  permissions: PopulatedPermission[];
  allowedPanels: string[];
  description: string;
  isActive: boolean;
}

// ── Login Partner ─────────────────────────────────────────────────────────────
export const loginAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    // ── Find admin + populate role ──────────────────────────────────────────
    const normalizedEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail }).populate<{
      role: PopulatedRole | null;
    }>({
      path: "role",
      populate: { path: "permissions" },
    });

    if (admin) {
      // Guard: role must exist (admins don't need isActive check)
      if (!admin.role) {
        res.status(422).json({
          message: tAuth("role_not_found"),
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        res.status(422).json({
          message: tAuth("invalid_email_password"),
        });
        return;
      }

      const token = generateJWTToken({
        id: admin._id.toString(),
        role: admin.role.name,
        permissions: (admin.role.permissions ?? [])
          .map((p) => p?.name)
          .filter((n): n is string => typeof n === "string"),
        allowedPanels: admin.role.allowedPanels || [],
      });

      const { password: _, ...adminWithoutPassword } = admin.toObject();

      res.status(200).json({
        message: tAuth("admin_login_success"),
        token,
        id: admin._id,
      });
      return;
    }

    // ── Find organisation + populate role ────────────────────────────────────
    const partner = await Organisation.findOne({
      email: normalizedEmail,
    }).populate<{
      role: PopulatedRole | null;
    }>({
      path: "role",
      populate: { path: "permissions" },
    });

    if (!partner) {
      console.log("Admin/Partner not found:", normalizedEmail);
      res.status(422).json({
        message: tAuth("user_not_found"),
      });
      return;
    }

    // ── Guard: role must exist ─────────────────────────────────
    if (!partner.role) {
      res.status(422).json({
        message: tAuth("role_not_found"),
      });
      return;
    }

    // ── Guard: role must be active ─────────────────────────────────
    if (!partner.role.isActive) {
      res.status(422).json({
        message: tAuth("org_not_active"),
      });
      return;
    }

    // ── Guard: organisation must be approved ─────────────────────────────────
    if (partner.status !== PartnerStatusEnum.APPROVED) {
      res.status(422).json({
        message: tAuth("org_not_verified"),
      });
      return;
    }

    // ── Check password ───────────────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
      res.status(422).json({
        message: tAuth("invalid_email_password"),
      });
      return;
    }

    // ── Generate JWT ─────────────────────────────────────────────────────────
    const token = generateJWTToken({
      id: partner._id.toString(),
      role: partner.role.name,
      permissions: (partner.role.permissions ?? [])
        .map((p) => p?.name)
        .filter((n): n is string => typeof n === "string"),
      allowedPanels: partner.role.allowedPanels || [],
    });

    // ── Strip password before sending ────────────────────────────────────────
    const { password: _, ...partnerWithoutPassword } = partner.toObject();

    res.status(200).json({
      message: tAuth("org_login_success"),
      token,
      id: partner._id,
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res
      .status(500)
      .json({ message: tAlerts("server_error") || (error as Error).message });
  }
};
