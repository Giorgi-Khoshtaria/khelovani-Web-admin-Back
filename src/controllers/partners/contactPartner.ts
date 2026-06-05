import mongoose from "mongoose";
import Organisation from "../../modules/organization.modules.js";
import User from "../../modules/user.modules.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { sendPartnerInquiryEmail } from "../../utils/email/sendPartnerEmail.js";

/**
 * @desc    Send a message to a partner (artisan) from the public profile.
 * @route   POST /api/partner/:id/contact
 * @access  Private — the logged-in user is the sender.
 */
export const contactPartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, message } = req.body as { subject: string; message: string };
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_partner_id"), 422);
  }

  const partner = await Organisation.findOne({
    _id: id,
    status: PartnerStatusEnum.APPROVED,
    isShown: true,
  }).select("companyNameGe companyNameEn email");

  if (!partner || !partner.email) {
    throw new AppError(tAlerts("partner_not_found") || "Partner not found", 404);
  }

  // The sender is the authenticated user.
  const sender = await User.findById(req.user!.id).select(
    "nameGe nameEn email phone",
  );
  if (!sender) {
    throw new AppError(tAlerts("user_not_found") || "User not found", 404);
  }

  const partnerName =
    (lang === "en" ? partner.companyNameEn : partner.companyNameGe) ||
    partner.companyNameEn ||
    partner.companyNameGe ||
    "";
  const senderName = sender.nameEn || sender.nameGe || sender.email;

  await sendPartnerInquiryEmail(partner.email, {
    partnerName,
    senderName,
    senderEmail: sender.email,
    senderPhone: sender.phone,
    subject,
    message,
  });

  sendResponse(res, 200, tAlerts("message_sent") || "Message sent");
});
