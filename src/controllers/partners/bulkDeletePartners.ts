import Organisation from "../../modules/organization.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";

/**
 * @desc    Bulk delete partners
 * @route   POST /api/admin/partners/bulk-delete
 * @access  Private Admin
 */
export const bulkDeletePartners = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  await Organisation.deleteMany({ _id: { $in: ids } });

  sendResponse(res, 200, tAlerts("partners_bulk_delete_success") || "Partners deleted successfully");
});
