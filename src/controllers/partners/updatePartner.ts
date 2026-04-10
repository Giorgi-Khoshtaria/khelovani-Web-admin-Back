import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { ROLES } from "../../middleware/role/permissions.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import mongoose from "mongoose";

import bcrypt from "bcrypt";

// @desc    Update partner info
// @route   PUT /api/partners/:id
// @access  Private Admin/Owner
export const updatePartner = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Hash password if updating
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      res.status(422).json({
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

    const partner = await Organisation.findById(id);

    if (!partner) {
      res.status(404).json({
        message: tAuth("partner_not_found"),
      });
      return;
    }

    // Prevent non-admins from updating sensitive fields
    if (req.user?.role !== ROLES.ADMIN) {
      delete updateData.status;
      delete updateData.role;
      delete updateData.password;
    }

    const updatedPartner = await Organisation.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    res.status(200).json(updatedPartner);
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res.status(500).json({ message: tAlerts("server_error") || (error as Error).message });
  }
};
