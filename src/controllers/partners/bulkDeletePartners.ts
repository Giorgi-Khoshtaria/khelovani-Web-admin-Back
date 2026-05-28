import mongoose from "mongoose";
import Organisation from "../../modules/organization.modules.js";
import Product from "../../modules/product.modules.js";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { invalidatePartners } from "../../utils/cache/invalidators.js";
import { logAdminAction } from "../../utils/audit/logAdminAction.js";

/**
 * @desc    Bulk delete partners
 * @route   POST /api/admin/partners/bulk-delete
 * @access  Private Admin
 */
export const bulkDeletePartners = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Organisation.deleteMany({ _id: { $in: ids } }, { session });
      await Product.deleteMany({ owner: { $in: ids } }, { session });
    });
  } finally {
    await session.endSession();
  }

  void invalidatePartners();
  logAdminAction(req, "PARTNERS_BULK_DELETED", "Organisation", undefined, {
    ids,
  });

  sendResponse(
    res,
    200,
    tAlerts("partners_bulk_delete_success") || "Partners deleted successfully",
  );
});
