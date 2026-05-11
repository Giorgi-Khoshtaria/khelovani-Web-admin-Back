import bcrypt from "bcrypt";
import crypto from "crypto";
import Organisation from "../../modules/organization.modules.js";
import Role from "../../modules/role.modules.js";
import { ROLES } from "../../middleware/role/permissions.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { PartnerTypeEnum } from "../../types/partnerTypes.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/errors/AppError.js";
import { invalidatePartners } from "../../utils/cache/invalidators.js";

/**
 * @desc    Register partner
 * @route   POST /api/partner/register
 * @access  Public
 */
export const registerPartner = asyncHandler(async (req, res) => {
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAuth } = useTranslation(lang, TranslationNamespace.Auth);
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);
  const data = req.body;

  const trimmedEmail = data.email.toLowerCase();

  // 1. Check email duplicate
  const existingByEmail = await Organisation.findOne({ email: trimmedEmail });
  if (existingByEmail) {
    throw new AppError(tAuth("email_already_exists"), 409);
  }

  const partnerType = data.partnerType === PartnerTypeEnum.INDIVIDUAL
    ? PartnerTypeEnum.INDIVIDUAL
    : PartnerTypeEnum.ORGANIZATION;

  // 2. Check ID uniqueness per type
  if (partnerType === PartnerTypeEnum.ORGANIZATION) {
    const existing = await Organisation.findOne({ identificationCode: data.identificationCode });
    if (existing) {
      throw new AppError(tAlerts("org_code_exists") || "Organization code already exists", 409);
    }
  } else {
    const existing = await Organisation.findOne({ personalNumber: data.personalNumber });
    if (existing) {
      throw new AppError(tAlerts("personal_number_exists") || "Personal number already registered", 409);
    }
  }

  // 3. Get Partner Role
  const partnerRole = await Role.findOne({ name: ROLES.ORGANISATION });
  if (!partnerRole) {
    throw new AppError(tAuth("org_role_not_found"), 500);
  }

  // 4. Generate Random Password
  const plainPassword = crypto.randomBytes(6).toString("hex");
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 5. Create Organisation
  const newOrg = await Organisation.create({
    partnerType,
    companyNameGe: data.companyNameGe.trim(),
    companyNameEn: data.companyNameEn.trim(),
    ...(partnerType === PartnerTypeEnum.ORGANIZATION
      ? { identificationCode: data.identificationCode.trim(), contactPerson: data.contactPerson.trim() }
      : { personalNumber: data.personalNumber.trim() }),
    phone: data.phone.trim(),
    city: data.city.trim().toLowerCase(),
    email: data.email.trim().toLowerCase(),
    address: data.address.trim(),
    addressEn: data.addressEn?.trim(),
    description: data.description?.trim(),
    descriptionEn: data.descriptionEn?.trim(),
    website: data.website?.trim(),
    facebook: data.facebook?.trim(),
    instagram: data.instagram?.trim(),
    tiktok: data.tiktok?.trim(),
    status: PartnerStatusEnum.PENDING,
    password: hashedPassword,
    role: partnerRole._id,
  });

  void invalidatePartners();

  const successKey = partnerType === PartnerTypeEnum.INDIVIDUAL ? "individual_registered" : "partner_registered";
  sendResponse(res, 201, tAuth(successKey) || tAuth("partner_registered"), {
    partner: {
      _id: (newOrg as any)._id,
      email: newOrg.email,
    },
  });
});
