import Organisation from "../../modules/organization.modules.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

/**
 * @desc    Get pinned partners for home page (max 7)
 * @route   GET /api/partner/pinned
 * @access  Public
 */
export const getPinnedPartners = asyncHandler(async (_req, res) => {
  const partners = await Organisation.find({
    status: PartnerStatusEnum.APPROVED,
    isShown: true,
    isPinned: true,
  })
    .select("-password")
    .sort({ pinnedAt: -1 })
    .limit(7);

  sendResponse(res, 200, "Pinned partners retrieved successfully", partners);
});
