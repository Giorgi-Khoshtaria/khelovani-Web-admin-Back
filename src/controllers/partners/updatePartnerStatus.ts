import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { 
  sendPartnerPasswordEmail, 
  sendPartnerStatusEmail 
} from "../../utils/email/sendPartnerEmail.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import mongoose from "mongoose";

// @desc    Update partner status
// @route   PUT /api/partners/:id/status
// @access  Private Admin
export const updatePartnerStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

    const partner = await Organisation.findById(id);

    if (!partner) {
      res.status(404).json({
        message: tAuth("partner_not_found"),
      });
      return;
    }

    if (status === PartnerStatusEnum.BANNED) {
      partner.status = PartnerStatusEnum.BANNED;
      await partner.save();
      res.status(200).json({
        message: tAlerts("partner_status_updated"),
      });
      return;
    }

    if (status === PartnerStatusEnum.APPROVED) {
      try {
        const plainPassword = crypto.randomBytes(6).toString("hex");
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        partner.password = hashedPassword;

        await sendPartnerPasswordEmail(
          partner.email,
          partner.companyNameGe,
          plainPassword,
        );
      } catch (emailError) {
        res.status(500).json({
          message: tAlerts("email_send_failed_status_not_updated"),
        });
        return;
      }
    }

    if (
      partner.status === PartnerStatusEnum.APPROVED &&
      status === PartnerStatusEnum.PENDING
    ) {
      res.status(422).json({
        message: tAlerts("status_transition_not_allowed"),
      });
      return;
    }

    partner.status = status;
    await partner.save();

    // 📧 Notification handling (Non-blocking for the API response)
    try {
      await sendPartnerStatusEmail(partner.email, status, partner.companyNameGe);
    } catch (emailError) {
      console.error("Failed to send partner status email:", emailError);
      // In test mode we don't want to fail if email fails, but in prod we still proceed 
      // as the partner status IS already updated in DB.
    }

    res.status(200).json({
      message: tAlerts("partner_status_updated"),
      _id: partner._id,
      status: partner.status,
      email: partner.email,
      createdAt: (partner as any).createdAt,
      updatedAt: (partner as any).updatedAt,
    });
  } catch (error) {
    const lang = (req.query.lang as Lang) || "ge";
    const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
    res
      .status(500)
      .json({ message: tAlerts("server_error") || (error as Error).message });
  }
};
