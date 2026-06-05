import InformationField from "../../modules/informationField.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

/**
 * @desc    Public read of all information fields as a key→value map
 *          (e.g. { email, phone, address }) for the storefront.
 * @route   GET /api/information-fields
 * @access  Public
 */
export const getPublicInformationFields = asyncHandler(async (_req, res) => {
  const items = await InformationField.find().select("key value type").lean();

  const map: Record<string, string> = {};
  for (const item of items) {
    map[item.key] = item.value;
  }

  sendResponse(res, 200, "Information fields retrieved", map);
});
