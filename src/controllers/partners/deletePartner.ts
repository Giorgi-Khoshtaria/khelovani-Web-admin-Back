import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { ROLES } from "../../middleware/role/permissions.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import mongoose from "mongoose";

// @desc    Delete partner
// @route   DELETE /api/partners/:id
// @access  Private Admin/Owner
export const deletePartner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(422).json({
        message: tAlerts("invalid_partner_id"),
      });
      return;
    }

    // Only the partner themselves or an admin can delete their account
    if (req.user?.id !== id && req.user?.role !== ROLES.ADMIN) {
      res.status(403).json({
        message: tAuth("access_denied_only_owner_can_delete"),
      });
      return;
    }

    const partner = await Organisation.findById(id);

    if (!partner) {
      res.status(404).json({
        message: tAuth("partner_not_found"),
      });
      return;
    }

    await partner.deleteOne();

    res.status(200).json({
      message: tAlerts("partner_deleted"),
    });
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res.status(500).json({ message: tAlerts("server_error") || (error as Error).message });
  }
};
