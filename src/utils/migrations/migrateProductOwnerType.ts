import mongoose from "mongoose";
import Product from "../../modules/product.modules.js";
import Organisation from "../../modules/organization.modules.js";
import { PartnerTypeEnum } from "../../types/partnerTypes.js";

export async function migrateProductOwnerType() {
  const products = await Product.find({ ownerType: { $exists: false } }).lean();

  if (products.length === 0) {
    console.log("migrateProductOwnerType: nothing to migrate.");
    return;
  }

  let migrated = 0;
  let skipped = 0;

  for (const product of products) {
    const owner = await Organisation.findById(product.owner).lean();
    if (!owner) { skipped++; continue; }

    const ownerType = owner.partnerType === PartnerTypeEnum.INDIVIDUAL
      ? PartnerTypeEnum.INDIVIDUAL
      : PartnerTypeEnum.ORGANIZATION;

    await Product.updateOne(
      { _id: product._id },
      { $set: { ownerType } },
    );
    migrated++;
  }

  console.log(`migrateProductOwnerType: ${migrated} migrated, ${skipped} skipped (owner not found).`);
}
