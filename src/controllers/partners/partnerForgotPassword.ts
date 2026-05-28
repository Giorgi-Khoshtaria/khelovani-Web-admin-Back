import Organisation from "../../modules/organization.modules.js";
import { sendUserForgotPasswordEmail } from "../../utils/email/sendUserEmails.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

/**
 * @desc    Partner forgot password
 * @route   POST /api/partner/forgot-password
 * @access  Public
 */
export const partnerForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const trimmedEmail = email.trim().toLowerCase();

  const partner = await Organisation.findOne({ email: trimmedEmail });

  // Always 200 — prevents email enumeration
  if (!partner) {
    return sendResponse(res, 200, "If that email is registered, a reset link has been sent.");
  }

  await sendUserForgotPasswordEmail(trimmedEmail, "en");

  sendResponse(res, 200, "If that email is registered, a reset link has been sent.");
});
