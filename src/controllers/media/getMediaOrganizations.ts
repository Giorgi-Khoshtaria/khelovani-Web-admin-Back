import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import Organisation from "../../modules/organization.modules.js";

/**
 * @desc    Lightweight list of organisations for the Media Manager org filter.
 * @route   GET /api/admin/media/organizations
 * @access  Admin only
 */
export const getMediaOrganizations = asyncHandler(async (_req, res) => {
  const orgs = await Organisation.find()
    .select("companyNameGe companyNameEn")
    .sort({ companyNameGe: 1 })
    .lean();

  const data = orgs.map((o: any) => ({
    id: String(o._id),
    name: o.companyNameGe || o.companyNameEn || String(o._id),
  }));

  sendResponse(res, 200, "ორგანიზაციები ჩაიტვირთა", data);
});
