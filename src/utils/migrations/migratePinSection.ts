import Product from "../../modules/product.modules.js";
import { PinSectionEnum } from "../../types/productPin.js";

/**
 * One-shot migration: converts legacy `isPinned: true` documents
 * to `pinSection: "regular"` so they continue to appear on the home page.
 */
export async function migratePinSection() {
  const legacy = await Product.find({ isPinned: true } as any).lean();

  if (legacy.length === 0) {
    console.log("migratePinSection: no legacy pinned products found, nothing to do.");
    return;
  }

  const ids = legacy.map((p) => p._id);

  const result = await Product.updateMany(
    { _id: { $in: ids }, pinSection: null },
    { $set: { pinSection: PinSectionEnum.REGULAR } },
  );

  console.log(
    `migratePinSection: ${result.modifiedCount} product(s) moved to pinSection="regular".`,
  );
}
