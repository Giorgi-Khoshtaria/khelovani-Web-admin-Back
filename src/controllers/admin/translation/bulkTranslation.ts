import Translation, {
  Namespace,
} from "../../../modules/translation.modules.js";
import {
  loadTranslationCache,
  useTranslation,
} from "../../../types/translate.util.js";
import { Lang } from "../../../types/lang.types.js";
import { TranslationNamespace } from "../../../types/translation.enum.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { invalidateTranslations } from "../../../utils/cache/invalidators.js";

/**
 * @desc    Bulk create/update translations
 * @route   POST /api/admin/translations/bulk
 * @access  Private Admin
 */
export const bulkTranslation = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  if (!items || !Array.isArray(items)) {
    throw new AppError(
      tAlerts("invalid_payload_items_array") || "Invalid items array",
      400,
    );
  }

  const bulkOps = items.map((item: any) => ({
    updateOne: {
      filter: { namespace: item.namespace, key: item.key },
      update: {
        $set: {
          translations: {
            ge: item.ge || "",
            en: item.en || "",
          },
        },
      },
      upsert: true,
    },
  }));

  // Verify all namespaces exist
  const uniqueNamespaces = [
    ...new Set(items.map((item: any) => item.namespace)),
  ];
  const existingNamespaces = await Namespace.find({
    _id: { $in: uniqueNamespaces },
  });
  const existingIds = existingNamespaces.map((n) => n._id.toString());

  const invalidItems = items.filter(
    (item: any) => !existingIds.includes(item.namespace),
  );

  if (invalidItems.length > 0) {
    const uniqueInvalids = [
      ...new Set(invalidItems.map((i: any) => i.namespace)),
    ];
    throw new AppError(
      `${tAlerts("namespace_not_found")}: ${uniqueInvalids.join(", ")}`,
      422,
    );
  }

  // Insert/Update translations
  await Translation.bulkWrite(bulkOps);

  loadTranslationCache();
  void invalidateTranslations();

  sendResponse(
    res,
    200,
    tAlerts("translations_bulk_import_success") ||
      "Translations bulk processed successfully",
  );
});
