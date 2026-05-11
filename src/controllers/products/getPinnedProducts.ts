import Product from "../../modules/product.modules.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { PIN_CAP_PER_SECTION, PinSectionEnum } from "../../types/productPin.js";

const populate = { path: "owner", select: "companyNameGe companyNameEn" };

async function buildSection(condition: string): Promise<any[]> {
  const pinned = await Product.find({ pinSection: condition, isShown: true })
    .populate(populate)
    .sort({ pinnedAt: -1 })
    .limit(PIN_CAP_PER_SECTION)
    .lean();

  const remaining = PIN_CAP_PER_SECTION - pinned.length;
  if (remaining <= 0) return pinned;

  const autoFill = await Product.find({
    condition,
    isShown: true,
    _id: { $nin: pinned.map((p) => p._id) },
    pinSection: null,
  })
    .populate(populate)
    .sort({ createdAt: -1 })
    .limit(remaining)
    .lean();

  return [...pinned, ...autoFill];
}

/**
 * @desc    Get pinned products grouped by condition section, auto-filled to 4 each
 * @route   GET /api/products/pinned
 * @access  Public
 */
export const getPinnedProducts = asyncHandler(async (_req, res) => {
  const [handmade, made_to_order, limited_edition, one_of_a_kind, restored, upcycled] =
    await Promise.all([
      buildSection(PinSectionEnum.HANDMADE),
      buildSection(PinSectionEnum.MADE_TO_ORDER),
      buildSection(PinSectionEnum.LIMITED_EDITION),
      buildSection(PinSectionEnum.ONE_OF_A_KIND),
      buildSection(PinSectionEnum.RESTORED),
      buildSection(PinSectionEnum.UPCYCLED),
    ]);

  sendResponse(res, 200, "Pinned products retrieved successfully", {
    handmade,
    made_to_order,
    limited_edition,
    one_of_a_kind,
    restored,
    upcycled,
  });
});
