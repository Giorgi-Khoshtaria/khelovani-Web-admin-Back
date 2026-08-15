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
 * @desc    Update page
 * @route   PUT /api/admin/pages/:id
 * @access  Private Admin
 */
export const updatePage = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    throw new AppError(tAlerts("invalid_page_id") || "Invalid page ID", 422);
  }

  const { path, title, description, ogImage, noindex } = req.body;
  const updateData: Record<string, any> = {};
  if (path !== undefined) updateData.path = path;
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (ogImage !== undefined) updateData.ogImage = ogImage;
  if (noindex !== undefined) updateData.noindex = noindex;

  const item = await Page.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    throw new AppError(tAlerts("page_not_found") || "Page not found", 404);
  }

  void invalidatePage();
  sendResponse(res, 200, "Page updated successfully", item);
});
