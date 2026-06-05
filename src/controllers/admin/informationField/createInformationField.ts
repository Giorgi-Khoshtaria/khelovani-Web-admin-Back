import InformationField from "../../../modules/informationField.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { invalidateInformationFields } from "../../../utils/cache/invalidators.js";

/**
 * @desc    Create a new information field
 * @route   POST /api/admin/information-fields
 * @access  Private Admin — requires settings.edit permission
 */
export const createInformationField = asyncHandler(async (req, res) => {
  const { key, type, value, description } = req.body;

  const existing = await InformationField.findOne({ key });
  if (existing) {
    throw new AppError("An information field with this key already exists", 409);
  }

  const field = await InformationField.create({
    key,
    type,
    value,
    description,
  });

  void invalidateInformationFields();

  sendResponse(res, 201, "Information field created successfully", field);
});
