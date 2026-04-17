import bcrypt from "bcrypt";
import Admin from "../../../modules/admin.modules.js";
import Organisation from "../../../modules/organization.modules.js";
import { generateJWTToken } from "../../../utils/token/genereateJWT-token.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { PartnerStatusEnum } from "../../../types/partnerStatus.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Admin/Partner Login
 * @route   POST /api/admin/auth/login
 * @access  Public
 */
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try to find Admin first
  const admin = await Admin.findOne({ email: normalizedEmail }).populate({
    path: "role",
    populate: { path: "permissions" },
  });

  if (admin) {
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    // Use the same generic error for inactive role and wrong password to avoid enumeration
    if (!admin.role || !(admin.role as any).isActive || !isPasswordValid) {
      throw new AppError(tAuth("invalid_email_password"), 422);
    }

    const token = generateJWTToken({
      id: admin._id.toString(),
      role: (admin.role as any).name,
      permissions: ((admin.role as any).permissions ?? [])
        .map((p: any) => p?.name)
        .filter((n: any): n is string => typeof n === "string"),
      allowedPanels: (admin.role as any).allowedPanels || [],
    });

    return sendResponse(res, 200, tAuth("admin_login_success"), {
      token,
      id: admin._id,
    });
  }

  // 2. If not admin, try to find Organisation (Partner)
  const partner = await Organisation.findOne({
    email: normalizedEmail,
  }).populate({
    path: "role",
    populate: { path: "permissions" },
  });

  if (!partner) {
    throw new AppError(tAuth("user_not_found"), 422);
  }

  if (!partner.role) {
    throw new AppError(tAuth("role_not_found"), 422);
  }

  if (!(partner.role as any).isActive) {
    throw new AppError(tAuth("org_not_active"), 422);
  }

  if (partner.status !== PartnerStatusEnum.APPROVED) {
    throw new AppError(tAuth("org_not_verified"), 422);
  }

  const isPasswordValid = await bcrypt.compare(password, partner.password);
  if (!isPasswordValid) {
    throw new AppError(tAuth("invalid_email_password"), 422);
  }

  const token = generateJWTToken({
    id: partner._id.toString(),
    role: (partner.role as any).name,
    permissions: ((partner.role as any).permissions ?? [])
      .map((p: any) => p?.name)
      .filter((n: any): n is string => typeof n === "string"),
    allowedPanels: (partner.role as any).allowedPanels || [],
  });

  sendResponse(res, 200, tAuth("org_login_success"), {
    token,
    id: partner._id,
  });
});
