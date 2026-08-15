import mongoose from "mongoose";
import Page from "../../../modules/page.modules.js";
import { useTranslation } from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { invalidatePage } from "../../../utils/cache/invalidators.js";

/**
 * @desc    Delete page
 * @route   DELETE /api/admin/pages/:id
 * @access  Private Admin
 */
export const deletePage = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_page_id") || "Invalid page ID", 422);
  }

  const item = await Page.findByIdAndDelete(id);

  if (!item) {
    throw new AppError(tAlerts("page_not_found") || "Page not found", 404);
  }

  void invalidatePage();

  sendResponse(
    res,
    200,
    tAlerts("page_deleted_success") || "Page deleted successfully",
  );
});
