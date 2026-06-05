import InformationField from "../../../modules/informationField.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { invalidateInformationFields } from "../../../utils/cache/invalidators.js";

/**
 * @desc    Update an information field
 * @route   PUT /api/admin/information-fields/:id
 * @access  Private Admin — requires settings.edit permission
 */
export const updateInformationField = asyncHandler(async (req, res) => {
  const { key, type, value, description } = req.body;

  const field = await InformationField.findById(req.params.id);
  if (!field) throw new AppError("Information field not found", 404);

  if (key && key !== field.key) {
    const duplicate = await InformationField.findOne({ key });
    if (duplicate) {
      throw new AppError(
        "An information field with this key already exists",
        409
      );
    }
    field.key = key;
  }

  if (type !== undefined) field.type = type;
  if (value !== undefined) field.value = value;
  if (description !== undefined) field.description = description;

  await field.save();

  void invalidateInformationFields();

  sendResponse(res, 200, "Information field updated successfully", field);
});
