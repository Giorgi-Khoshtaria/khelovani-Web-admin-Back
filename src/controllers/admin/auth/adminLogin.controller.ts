import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { validateLoginForm } from "../../../validations/forms/loginValidation.js";
import { PartnerStatusEnum } from "../../../utils/types/partnerStatus.js";
import { generateJWTToken } from "../../../utils/token/genereateJWT-token.js";
import Organisation from "../../../modules/organization.modules.js";
import Admin from "../../../modules/admin.modules.js";

interface PopulatedRole {
  _id: Types.ObjectId;
  name: string;
  permissions: string[];
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
    }>("role");

    if (admin) {
      if (!admin.role || !admin.role.isActive) {
        res
          .status(403)
          .json({ message: "ადმინისტრატორის როლი არ არის აქტიური" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        res.status(422).json({ message: "არასწორი მეილი ან პაროლი" });
        return;
      }

      const token = generateJWTToken({
        id: admin._id.toString(),
        role: admin.role.name,
        permissions: admin.role.permissions,
        allowedPanels: admin.role.allowedPanels,
      });

      const { password: _, ...adminWithoutPassword } = admin.toObject();

      res.status(200).json({
        message: "ადმინისტრატორი წარმატებით შევიდა სისტემაში",
        token,
        // admin: adminWithoutPassword,
        // userType: "admin",
      });
      return;
    }

    // ── Find organisation + populate role ────────────────────────────────────
    const partner = await Organisation.findOne({ email }).populate<{
      role: PopulatedRole;
    }>("role");

    if (!partner) {
      res.status(422).json({ message: "მომხმარებელი არ მოიძებნა" });
      return;
    }

    // ── Guard: role must exist and be active ─────────────────────────────────
    if (!partner.role || !partner.role.isActive) {
      res.status(403).json({ message: "ორგანიზაცია არ არის აქტიური" });
      return;
    }

    // ── Guard: organisation must be approved ─────────────────────────────────
    if (partner.status !== PartnerStatusEnum.APPROVED) {
      res
        .status(403)
        .json({ message: "ორგანიზაცია ჯერ არ არის დადასტურებული" });
      return;
    }

    // ── Check password ───────────────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
      res.status(422).json({ message: "არასწორი მეილი ან პაროლი" });
      return;
    }

    // ── Generate JWT ─────────────────────────────────────────────────────────
    const token = generateJWTToken({
      id: partner._id.toString(),
      role: partner.role.name,
      permissions: partner.role.permissions,
      allowedPanels: partner.role.allowedPanels,
    });

    // ── Strip password before sending ────────────────────────────────────────
    const { password: _, ...partnerWithoutPassword } = partner.toObject();

    res.status(200).json({
      message: "ორგანიზაცია წარმატებით შევიდა სისტემაში",
      token,
      // partner: partnerWithoutPassword,
      // userType: "partner",
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
