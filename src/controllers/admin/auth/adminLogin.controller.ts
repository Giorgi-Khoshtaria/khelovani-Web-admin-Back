import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { validateLoginForm } from "../../../validations/forms/loginValidation.js";
import { PartnerStatusEnum } from "../../../types/partnerStatus.js";
import { generateJWTToken } from "../../../utils/token/genereateJWT-token.js";
import Organisation from "../../../modules/organization.modules.js";
import Admin from "../../../modules/admin.modules.js";

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
``;

// ── Login Partner ─────────────────────────────────────────────────────────────
export const loginAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // ── Validate fields ──────────────────────────────────────────────────────
    const validationErrors = validateLoginForm({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      res.status(422).json({ errors: validationErrors });
      return;
    }

    // ── Find admin + populate role ──────────────────────────────────────────
    const admin = await Admin.findOne({ email }).populate<{
      role: PopulatedRole;
    }>({
      path: "role",
      populate: { path: "permissions" },
    });

    if (admin) {
      if (!admin.role || !admin.role.isActive) {
        res
          .status(403)
          .json({ message: "admin_role_not_active" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        res.status(422).json({ message: "invalid_email_or_password" });
        return;
      }

      const token = generateJWTToken({
        id: admin._id.toString(),
        role: admin.role.name,
        permissions: admin.role.permissions?.map((p) => p.name) || [],
        allowedPanels: admin.role.allowedPanels || [],
      });

      const { password: _, ...adminWithoutPassword } = admin.toObject();

      res.status(200).json({
        message: "admin_login_success",
        token,
        // admin: adminWithoutPassword,
        // userType: "admin",
      });
      return;
    }

    // ── Find organisation + populate role ────────────────────────────────────
    const partner = await Organisation.findOne({ email }).populate<{
      role: PopulatedRole;
    }>({
      path: "role",
      populate: { path: "permissions" },
    });

    if (!partner) {
      res.status(422).json({ message: "user_not_found" });
      return;
    }

    // ── Guard: role must exist and be active ─────────────────────────────────
    if (!partner.role || !partner.role.isActive) {
      res.status(403).json({ message: "org_not_active" });
      return;
    }

    // ── Guard: organisation must be approved ─────────────────────────────────
    if (partner.status !== PartnerStatusEnum.APPROVED) {
      res
        .status(403)
        .json({ message: "org_not_verified" });
      return;
    }

    // ── Check password ───────────────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
      res.status(422).json({ message: "invalid_email_or_password" });
      return;
    }

    // ── Generate JWT ─────────────────────────────────────────────────────────
    const token = generateJWTToken({
      id: partner._id.toString(),
      role: partner.role.name,
      permissions: partner.role.permissions?.map((p) => p.name) || [],
      allowedPanels: partner.role.allowedPanels || [],
    });

    // ── Strip password before sending ────────────────────────────────────────
    const { password: _, ...partnerWithoutPassword } = partner.toObject();

    res.status(200).json({
      message: "org_login_success",
      token,
      // partner: partnerWithoutPassword,
      // userType: "partner",
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
