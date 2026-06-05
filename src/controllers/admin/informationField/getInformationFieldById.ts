import InformationField from "../../../modules/informationField.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";

/**
 * @desc    Get a single information field by id
 * @route   GET /api/admin/information-fields/:id
 * @access  Private Admin — requires settings.view permission
 */
export const getInformationFieldById = asyncHandler(async (req, res) => {
  const field = await InformationField.findById(req.params.id).lean();
  if (!field) throw new AppError("Information field not found", 404);
  sendResponse(res, 200, "Information field retrieved successfully", field);
});
