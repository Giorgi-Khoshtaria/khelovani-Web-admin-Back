import { Request, Response } from "express";
import Organisation from "../../modules/organization.modules.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendPartnerPasswordEmail } from "../../utils/email/sendPartnerEmail.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { invalidatePartnerById } from "../../utils/cache/invalidators.js";
import { logAdminAction } from "../../utils/audit/logAdminAction.js";

// @desc    Update partner status
// @route   PUT /api/partners/:id/status
// @access  Private Admin
export const updatePartnerStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

  const partner = await Organisation.findById(id);

  if (!partner) {
    throw new AppError(tAuth("partner_not_found") || "Partner not found", 404);
  }

  if (status === PartnerStatusEnum.BANNED) {
    partner.status = PartnerStatusEnum.BANNED;
    await partner.save();
    invalidatePartnerById(id as string);
    logAdminAction(req, "PARTNER_BANNED", "Organisation", id as string, { email: partner.email });
    return sendResponse(res, 200, tAlerts("partner_status_updated") || "Partner status updated");
  }

  // Guard: APPROVED → PENDING is not allowed
  if (
    partner.status === PartnerStatusEnum.APPROVED &&
    status === PartnerStatusEnum.PENDING
  ) {
    throw new AppError(tAlerts("status_transition_not_allowed") || "Status transition not allowed", 422);
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
      console.error("Email send failed (status update):", emailError);
    }
  }

  partner.status = status;
  await partner.save();

  invalidatePartnerById(id as string);
  logAdminAction(req, "PARTNER_STATUS_UPDATED", "Organisation", id as string, { status, email: partner.email });

  sendResponse(res, 200, tAlerts("partner_status_updated") || "Partner status updated", {
    _id: partner._id,
    status: partner.status,
    email: partner.email,
    createdAt: (partner as any).createdAt,
    updatedAt: (partner as any).updatedAt,
  });
});
