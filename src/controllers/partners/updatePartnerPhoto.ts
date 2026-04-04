import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { ROLES } from "../../middleware/role/permissions.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import mongoose from "mongoose";

// @desc    Update partner photo
// @route   PUT /api/partners/:id/photo
// @access  Private Admin/Owner
export const updatePartnerPhoto = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);
 
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(400).json({
        message: tAlerts("invalid_partner_id"),
      });
      return;
    }

    // Check if user is admin or is updating their own profile
    if (req.user?.role !== ROLES.ADMIN && req.user?.id !== id) {
      res.status(403).json({
        message: tAuth("access_denied"),
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: tAlerts("no_file_uploaded") });
      return;
    }

    const imageUrl = req.file.path;

    const partner = await Organisation.findByIdAndUpdate(
      id,
      { $set: { profilePhoto: imageUrl } },
      { new: true },
    ).select("-password");

    if (!partner) {
      res.status(404).json({
        message: tAuth("partner_not_found"),
      });
      return;
    }

    res.status(200).json(partner);
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res.status(500).json({ message: tAlerts("server_error") || (error as Error).message });
  }
};
