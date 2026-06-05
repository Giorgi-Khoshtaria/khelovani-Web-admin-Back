import InformationField from "../../../modules/informationField.modules.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { invalidateInformationFields } from "../../../utils/cache/invalidators.js";

/**
 * @desc    Delete an information field
 * @route   DELETE /api/admin/information-fields/:id
 * @access  Private Admin — requires settings.edit permission
 */
export const deleteInformationField = asyncHandler(async (req, res) => {
  const field = await InformationField.findByIdAndDelete(req.params.id);
  if (!field) throw new AppError("Information field not found", 404);

  void invalidateInformationFields();

  sendResponse(res, 200, "Information field deleted successfully");
});
